import { cssStyle } from "./style";
import { update } from "./utils/scheduleService";
import { ATTTRIBUTES } from "./utils/constants";
import { isScrolledIntoView } from "./utils/helpers";
import { isActiveProgram, progress } from "./utils/time";

export class ConsuoEPG extends HTMLElement {
  static get observedAttributes() {
    return [
      ATTTRIBUTES.API_URL,
      ATTTRIBUTES.CHANNEL_ID,
      ATTTRIBUTES.UPDATE_INTERVAL,
    ];
  }

  constructor() {
    super();
    this.schedule = [];
  }

  async connectedCallback() {
    this[ATTTRIBUTES.API_URL] = this.getAttribute(ATTTRIBUTES.API_URL);
    this[ATTTRIBUTES.CHANNEL_ID] = this.getAttribute(ATTTRIBUTES.CHANNEL_ID);
    this[ATTTRIBUTES.UPDATE_INTERVAL] = this.getAttribute(
      ATTTRIBUTES.UPDATE_INTERVAL
    );
    /**
     * Call fetch data if we have the correct attributes
     */
    this.innerHTML = ``;
    this.refreshEPG();
  }

  style() {
    let styleExist = this.querySelector("style");
    if (styleExist) return;
    const style = document.createElement("style");
    style.innerHTML = cssStyle;
    this.appendChild(style);
  }

  render() {
    let container = this.querySelector(".consuo-epg-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "consuo-epg-container";
    } else {
      container.innerHTML = "";
    }

    this.schedule.forEach((program) => {
      container.innerHTML += this.renderProgramItem(program);
    });

    this.appendChild(container);
    this.refreshProgressBars();
    this.style();

    const active = this.querySelector("div[data-active='active'");
    if (isScrolledIntoView(active)) {
      active.scrollIntoView({
        inline: "center",
      });
    } else {
      window.addEventListener("scroll", () => {
        if (isScrolledIntoView(active)) {
          active.scrollIntoView({
            inline: "center",
          });
        }
      });
    }

  }

  renderProgramItem(program) {
    const startTime = new Date(program.start).toLocaleTimeString();
    const endTime = new Date(program.end).toLocaleTimeString();
    const active = isActiveProgram(program);

    const programItemWidth =
      program.duration > 500
        ? 500
        : program.duration < 150
        ? 150
        : program.duration;

    return `
      <div class="program-item" ${
        active ? "data-active='active'" : ""
      } data-uri='${program.uri}' style="width: ${programItemWidth}px;">
        <h3>${program.title}</h3>
        <span>${startTime} - ${endTime}</span>
      </div>
    `;
  }

  renderProgressBar() {
    const programItems = this.querySelectorAll(".program-item");
    for (let i = 0; i < programItems.length; i++) {
      const programItemCard = programItems[i];
      const program = this.schedule[i];

      const endTime = new Date(program.end).toLocaleTimeString();
      const currentTime = new Date().toLocaleTimeString();

      const isActive = isActiveProgram(program);
      const markedAsActive = programItemCard.getAttribute("data-active");
      if (!isActive && markedAsActive) {
        programItemCard.removeAttribute("data-active");
      } else if (isActive && !markedAsActive) {
        programItemCard.setAttribute("data-active", "active");
      }

      const percentage = progress(program);
      const progressWidth =
        endTime < currentTime ? "100%" : isActive ? `${percentage}%` : "0%";
      let progressBar = programItemCard.querySelector(".progress");
      if (!progressBar) {
        progressBar = document.createElement("span");
        progressBar.className = "progress";
        programItemCard.append(progressBar);
      }
      progressBar.style.width = progressWidth;
    }
  }

  async refreshProgressBars() {
    setInterval(() => {
      this.renderProgressBar();
    }, 1000);
  }

  async refreshEPG() {
    if (this.scheduleUpdater) {
      clearInterval(this.scheduleUpdater);
    }
    if (this[ATTTRIBUTES.API_URL] && this[ATTTRIBUTES.CHANNEL_ID]) {
      this.schedule = await update(
        this[ATTTRIBUTES.API_URL],
        this[ATTTRIBUTES.CHANNEL_ID]
      );
      this.render();
      if (this[ATTTRIBUTES.UPDATE_INTERVAL]) {
        this.scheduleUpdater = setInterval(async () => {
          this.schedule = await update(
            this[ATTTRIBUTES.API_URL],
            this[ATTTRIBUTES.CHANNEL_ID]
          );
          this.render();
        }, this[ATTTRIBUTES.UPDATE_INTERVAL] * 1000);
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    if (oldValue) {
      this.refreshEPG();
    }
  }

  disconnectedCallback() {
    clearInterval(this.scheduleUpdater);
  }
}
customElements.define("consuo-epg", ConsuoEPG);

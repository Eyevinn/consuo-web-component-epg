import { update } from "./utils/scheduleService";
import { ATTTRIBUTES } from "./utils/constants";

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
    this.refresh();
  }

  style() {
    let styleExist = this.querySelector("style");
    if (styleExist) return;
    const style = document.createElement("style");
    style.innerHTML = `
      .consuo-epg-container {
        width: 100%;
        display: grid;
        grid-auto-flow: column;
        overflow: scroll;
      }
      h3 {
        margin: 0;
      }
      div.program-item {
        position: relative;
        padding: 10px 20px;
        border-right: 1px solid #c9c9c9;
      }
      div.program-item span.progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        width: 0px;
        background-color: darkred;
      }
      div[data-active="active"] {
        background-color: rgba(0,0,0,0.2);
      }
      div[data-active="active"] span.progress {
        background-color: red;
      }
    `;
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
    this.style();

    const active = this.querySelector("div[data-active='active'");
    active.scrollIntoView({
      inline: "center",
    });
  }

  renderProgramItem(program) {
    const programStartTime = program.start_time;
    const programEndTime = program.end_time;
    const programDuration = programEndTime - programStartTime;
    const percentage = Math.floor(
      ((Date.now() - programStartTime) / programDuration) * 100
    );

    const startTime = new Date(program.start).toLocaleTimeString();
    const endTime = new Date(program.end).toLocaleTimeString();
    const currentTime = new Date().toLocaleTimeString();
    const active = startTime < currentTime && currentTime < endTime;
    const width =
      program.duration > 500
        ? 500
        : program.duration < 150
        ? 150
        : program.duration;
    const progress =
      endTime < currentTime ? "100%" : active ? `${percentage}%` : "0%";
    return `
      <div class="program-item" ${
        active ? "data-active='active'" : ""
      } style="width: ${width}px;">
        <h3>${program.title}</h3>
        <span>${startTime} - ${endTime}</span>
        <span class="progress" style="width:${progress};"></span>
      </div>
    `;
  }

  async refresh() {
    /**
     * If a scheduler is set up since before, delete it since we will create a new one if the interval has changed
     */
    if (this.scheduleUpdater) {
      clearInterval(this.scheduleUpdater);
    }

    /**
     * If we have the api url and channel id we can at least do a single schedule call
     */
    if (this[ATTTRIBUTES.API_URL] && this[ATTTRIBUTES.CHANNEL_ID]) {
      this.schedule = await update(
        this[ATTTRIBUTES.API_URL],
        this[ATTTRIBUTES.CHANNEL_ID]
      );
      this.render();
      /**
       * If we have an interval specified as well, we can set it up to refresh the schedule
       */
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
    /**
     * Set the internal property to the new attribute value
     */
    this[name] = newValue;
    /**
     * Only refresh if we do not go from null, since that will happen in the setup
     */
    if (oldValue) {
      this.refresh();
    }
  }

  disconnectedCallback() {
    clearInterval(this.scheduleUpdater);
  }
}
customElements.define("consuo-epg", ConsuoEPG);

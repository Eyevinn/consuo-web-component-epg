export const cssStyle = `
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

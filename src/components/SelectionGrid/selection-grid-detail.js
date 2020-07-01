import React from "react";
import { Dialog } from "@blueprintjs/core";
import style from "./selection-grid.module.css";
import HoverPopover from "../HoverPopover/HoverPopover";
import { ReactComponent as SelectedIcon } from "../../assets/Selected-Project.svg";
import { ReactComponent as UnselectedIcon } from "../../assets/Unselected-Project.svg";
import { ReactComponent as Tick } from "../../assets/tick.svg";
import { ReactComponent as Cross } from "../../assets/cross.svg";
import { getFieldColor } from "../../util/utility";

export default class SelectionGridDetail extends React.Component {
  constructor(props) {
    super();
    this.state = {
      hovered: false,
      mouseLocation: [0, 0],
      selectDialogIsOpen: false
    };
    this.renderHover = this.renderHover.bind(this);
    this.dialogOpened = this.dialogOpened.bind(this);
    this.dialogClosed = this.dialogClosed.bind(this);
    this.dialogOption = this.dialogOption.bind(this);
  }
  getPointLocation(pt, scale) {
    let [x, y] = pt;
    let newX = (x + 0.1) * scale;
    let newY = (y + 0.1) * scale;
    return newX + " " + newY;
  }

  dialogOpened() {
    this.props.selectDialogOpened();
    this.setState({ selectDialogIsOpen: true });
  }
  dialogClosed() {
    this.setState({ selectDialogIsOpen: false });
  }

  dialogOption(x) {
    this.props.changeGraph(x);
    this.setState({ selectDialogIsOpen: false });
  }

  renderHover(hovered, mouseLocation) {
    return (
      hovered !== false && (
        <HoverPopover
          width={"15em"}
          height="20px"
          locationX={mouseLocation[0]}
          locationY={mouseLocation[1] - 20}
        >
          <p
            style={{
              position: "absolute",
              backgroundColor: "#1c1d1f",
              margin: "0",
              fontSize: "10px",
              color: "#afca0b",
              fontWeight: "500",
              letterSpacing: "1px",
              overflow: "hidden",
              padding: "5px 10px"
            }}
          >
            <label>{this.props.selectedOrdering.titles[hovered]}</label>
          </p>
        </HoverPopover>
      )
    );
  }

  render() {
    const { selectedOrdering, selectedState, width } = this.props;
    const scale = width * 0.8;
    if (!selectedOrdering) {
      return <div />;
    }
    return (
      <div className={style.selectionDetailWrapper}>
        <Dialog
          isOpen={this.state.selectDialogIsOpen}
          onClose={this.dialogClosed}
          className={style.bp3Dialog}
        >
          <div className={style.selectDialog}>
            <div className={style.selectButtons}>
              <span
                className={style.selectButton}
                onClick={() => this.dialogOption("0")}
              >
                Zurück in die allgemeine Visualisierung (WISSEN-View)
              </span>
              <span
                className={style.selectButton}
                onClick={() => this.dialogOption("3")}
              >
                In der Grid-View bleiben
              </span>
            </div>

            <div className={style.closeSelect} onClick={this.dialogClosed}>
              Fenster schließen
            </div>
          </div>
        </Dialog>
        <svg height={width} width={width} fill="transparent">
          <rect
            stroke="#222"
            strokeWidth="6px"
            height={width}
            width={width}
            fill="transparent"
          />
          {selectedOrdering.projects.map((project, i) => (
            <g
              transform={
                "translate(" + this.getPointLocation(project, scale) + ")"
              }
              key={i + "punkt"}
              onMouseOver={evt => {
                this.setState({
                  hovered: i,
                  mouseLocation: [
                    evt.nativeEvent.clientX,
                    evt.nativeEvent.clientY
                  ]
                });
              }}
              onMouseLeave={() => {
                this.setState({
                  hovered: false,
                  mouseLocation: [0, 0]
                });
              }}
            >
              <UnselectedIcon
                width={width / 30}
                height={width / 30}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0"
                y="0"
                viewBox="0 0 100 100"
                cursor="POINTER"
                stroke={"transparent"}
                fill={getFieldColor(selectedOrdering.classes[i])}
              />
              <SelectedIcon
                width={width / 30}
                height={width / 30}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0"
                y="0"
                viewBox="0 0 100 100"
                cursor="POINTER"
                stroke={"transparent"}
                fill={getFieldColor(selectedOrdering.classes[i])}
                style={{
                  opacity: this.state.hovered === i ? "1" : "0",
                  transition: "opacity 800ms"
                }}
              />
            </g>
          ))}
        </svg>
        <div className={style.chooseButtonWrapper}>
          <span
            className={style.chooseButton}
            onClick={() => {
              this.props.selectOrdering(selectedState);
              this.dialogOpened();
            }}
          >
            Auswählen
            <Tick
              style={{ marginLeft: "15px" }}
              width={width / 25}
              height={width / 25}
            />
          </span>
          <span
            className={style.chooseButton}
            onClick={() => {
              this.props.selectOrdering([selectedState[0], selectedState[0]]);
              this.dialogOpened();
            }}
          >
            Abbrechen
            <Cross
              style={{ marginLeft: "15px" }}
              width={width / 35}
              height={width / 35}
            />
          </span>
        </div>
        {this.renderHover(this.state.hovered, this.state.mouseLocation)}
      </div>
    );
  }
}

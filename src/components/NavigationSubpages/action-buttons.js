import React, { Component } from "react";
import { connect } from "react-redux";
import introJs from "intro.js";
import classes from "./navigation-subpages.module.css";
import { Dialog } from "@blueprintjs/core";
import { ReactComponent as Tutorial } from "../../assets/Icon-Tutorial.svg";
import { ReactComponent as Teilen } from "../../assets/Icon-Teilen.svg";
import { ReactComponent as Reset } from "../../assets/Icon-Reset.svg";
import {
  infraHovered,
  catHovered,
  unHovered,
  highlightUncertainty,
  showUncertainty
} from "../../store/actions/actions";
class ActionButtons extends Component {
  constructor(props) {
    super();
    this.startPageTour = this.startPageTour.bind(this);
    this.dialogOpened = this.dialogOpened.bind(this);
    this.dialogClosed = this.dialogClosed.bind(this);
    this.state = {
      shareDialogIsOpen: false
    };
  }

  dialogOpened() {
    this.setState({ shareDialogIsOpen: true });
  }
  dialogClosed() {
    this.setState({ shareDialogIsOpen: false });
  }

  copiedToClipboard() {
    const input = document.getElementById("share_input");
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    window.alert("Copied link: \n" + input.value);
  }

  startPageTour() {
    var tour = introJs();
    tour.setOptions({
      tooltipPosition: "auto",
      showStepNumbers: false,
      overlayOpacity: 0.1,
      tooltipClass: classes.introTooltip,
      highlightClass: classes.introPageHighlightClass,
      nextLabel: "Weiter",
      prevLabel: "Zurück",
      skipLabel: "Abbrechen",
      doneLabel: "Fertig"
    });
    tour
      .onbeforechange(() => {
        switch (tour._currentStep) {
          case 1: {
            this.props.onShowUncertainty(true);
            this.props.onHighlightUncertainty(true);
            break;
          }
          case 2: {
            this.props.onHighlightUncertainty(false);
            this.props.onShowUncertainty(false);
            this.props.onCatHovered(23);
            break;
          }
          case 3: {
            this.props.onCatHovered(19);
            break;
          }
          case 4: {
            this.props.onInfraHovered("Meteorite");
            break;
          }
          case 5: {
            this.props.onInfraHovered("Hochleistungsrechner");
            break;
          }
          default: {
            break;
          }
        }
      })
      .onexit(() => this.props.onUnHovered());
    tour.start();
  }

  render() {
    const { shareDialogIsOpen } = this.state;
    return (
      <>
        <Dialog
          isOpen={shareDialogIsOpen}
          onClose={this.dialogClosed}
          className={classes.bp3Dialog}
        >
          <div className={classes.shareDialog}>
            <div className={classes.shareHeader}>
              {" "}
              Die aktuelle Auswahl teilen:{" "}
            </div>
            <div>
              <input
                id={"share_input"}
                className={classes.shareInput}
                value={window.location}
                readOnly={true}
              />
              <span
                className={classes.shareClipboardLink}
                onClick={this.copiedToClipboard}
              >
                In die Zwischenablage kopieren
              </span>
            </div>
            <div className={classes.closeShare} onClick={this.dialogClosed}>
              Fertig
            </div>
          </div>
        </Dialog>
        <div className={classes.rightPanel} id="step4">
          <div className={classes.rightElement} onClick={this.startPageTour}>
            <Tutorial className={classes.buttonIcon} /> <p>Tutorial</p>
          </div>
          <div className={classes.rightElement} onClick={this.dialogOpened}>
            <Teilen className={classes.buttonIcon} /> <p>Teilen</p>
          </div>

          <div
            className={classes.rightElement}
            onClick={() => window.open(window.location.origin, "_self")}
          >
            <Reset className={classes.buttonIcon} /> <p>Zurücksetzen</p>
          </div>
        </div>
      </>
    );
  }
}
const mapDispatchToProps = dispatch => ({
  onUnHovered: value => {
    dispatch(unHovered());
  },
  onCatHovered: value => {
    dispatch(catHovered(value));
  },
  onInfraHovered: value => {
    dispatch(infraHovered(value));
  },
  onHighlightUncertainty: value => {
    dispatch(highlightUncertainty(value));
  },
  onShowUncertainty: value => {
    dispatch(showUncertainty(value));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(ActionButtons);
import React from "react";
import PropTypes from "prop-types";
import { ReactComponent as SelectedIcon } from "../../assets/Selected-Project.svg";
import { ReactComponent as UnselectedIcon } from "../../assets/Unselected-Project.svg";
import HoverPopover from "../HoverPopover/HoverPopover";

export default class ClusterDot extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    color: PropTypes.string
  };

  static defaultProps = { x: 0, y: 0, color: "white" };

  renderProjectsHover() {
    return (
      this.props.point.projectData &&
      this.props.highlightedProjects.find(
        hProject => hProject === this.props.point.projectData.id
      ) && (
        <g
          style={{
            position: "absolute",
            zIndex: "999"
          }}
        >
          <text x="25" y="-20" fill="#afca0b" fontSize="10px">
            {this.props
              .splitLongTitles(this.props.point.projectData.title)
              .map((titlePart, j) => (
                <tspan x="25" y={-20 + j * 10}>
                  {titlePart}
                </tspan>
              ))}
          </text>
        </g>
      )
    );
  }

  render() {
    const { x, y, color } = this.props;
    const scale =
      this.props.point.projectData &&
      this.props.highlightedProjects.find(
        hProject => hProject === this.props.point.projectData.id
      )
        ? 1.2
        : 1;

    return (
      <g
        onMouseOver={() => {
          if (this.props.point.projectData) {
            this.props.highlightProject(this.props.point.projectData.id);
          }
        }}
        onMouseOut={() => this.props.unHighlight()}
        onClick={() => {
          this.props.showProjectDetails();
        }}
        transform={
          "translate(" +
          (x - (this.props.radius / 30) * scale) +
          "," +
          (y - (this.props.radius / 30) * scale) +
          ")"
        }
      >
        <circle
          cx={this.props.radius / 60}
          cy={this.props.radius / 60}
          r={this.props.radius / 35}
          fill={"transparent"}
        />
        {this.props.point.projectData &&
        this.props.highlightedProjects.find(
          hProject => hProject === this.props.point.projectData.id
        ) ? (
          <g>
            <SelectedIcon
              width={(this.props.radius / 15) * scale}
              height={(this.props.radius / 15) * scale}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 100 100"
              fill={color}
              stroke="#7c7c7c"
              cursor="POINTER"
            />
          </g>
        ) : (
          <UnselectedIcon
            width={(this.props.radius / 15) * scale}
            height={(this.props.radius / 15) * scale}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 100 100"
            fill={color}
            stroke="#7c7c7c"
            cursor="POINTER"
          />
        )}
        {this.renderProjectsHover()}
      </g>
    );
  }
}

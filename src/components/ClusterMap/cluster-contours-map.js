import React from "react";
import { contours as d3Contours } from "d3-contour";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { extent as d3extent } from "d3-array";
import { geoPath as d3GeoPath } from "d3-geo";
import uncertainties from "../../assets/uncertainties.json";

const scaleContours = (
  cont,
  width,
  height,
  contoursSize,
  clusterSize,
  clusterX,
  clusterY,
  scale
) => {
  const coords = cont.coordinates;
  const factor = clusterSize(scale);
  const ClusterPosX = clusterX(width, scale);
  const ClusterPosY = clusterY(height, scale);
  const scaledCoords = coords.map(cGroup =>
    cGroup.map(c =>
      c.map(point => [
        ((point[0] * 0.9) / contoursSize) * factor + ClusterPosX,
        ((point[1] * 0.9) / contoursSize) * factor + ClusterPosY
      ])
    )
  );
  return {
    ...cont,
    coordinates: scaledCoords
  };
};

const constructContours = (topography, contoursSize) =>
  d3Contours()
    .size([contoursSize, contoursSize])
    .thresholds(30)
    .smooth([true])(topography);

const computeColorMap = topography =>
  d3ScaleLinear()
    .domain(d3extent(topography))
    .range(["#0a0a0a", "#aaa"]);

class ClusterContoursMap extends React.Component {
  constructor(props) {
    super();
    const { selectedOrdering, contoursSize } = props;
    this.state = {
      topography: uncertainties[selectedOrdering]
    };
    this.contours = constructContours(
      uncertainties[selectedOrdering],
      contoursSize
    );
    this.colorMap = computeColorMap(uncertainties[selectedOrdering]);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      this.props.selectedOrdering !== nextProps.selectedOrdering ||
      this.props.uncertaintyHighlighted !== nextProps.uncertaintyHighlighted
    );
  }

  render() {
    const {
      width,
      height,
      contoursSize,
      clusterSize,
      clusterX,
      clusterY,
      selectedOrdering
    } = this.props;
    if (uncertainties[selectedOrdering] !== this.state.topography) {
      let topography = uncertainties[selectedOrdering];
      this.contours = constructContours(topography, contoursSize);
      this.colorMap = computeColorMap(topography);
      this.setState({
        topography: topography
      });
    }
    const emptyColourValue = uncertainties[selectedOrdering][0];
    const lineFunction = d3GeoPath();
    const scale = Math.min(height, width);
    return (
      <g fill="transparent">
        {this.contours.map(cont => {
          const scaledContours = scaleContours(
            cont,
            width,
            height,
            contoursSize,
            clusterSize,
            clusterX,
            clusterY,
            scale
          );
          return (
            <path
              className="isoline"
              key={cont.value}
              d={lineFunction(scaledContours)}
              fill={
                cont.value > emptyColourValue
                  ? this.colorMap(cont.value)
                  : "#0e0e0e"
              }
            />
          );
        })}
        <circle
          cx={clusterX(width, scale) + 0.5 * clusterSize(scale)}
          cy={clusterY(height, scale) + 0.5 * clusterSize(scale)}
          r={clusterSize(scale) * 0.58}
          fill={this.props.uncertaintyHighlighted ? "#afca0b22" : "none"}
        />
      </g>
    );
  }
}

export default ClusterContoursMap;

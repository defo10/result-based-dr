import React from "react";
import style from "./geo-map-view.module.css";
import { ReactComponent as Africa } from "../../assets/GeoMap/continents/africa.svg";
import { ReactComponent as Europe } from "../../assets/GeoMap/continents/europe.svg";
import { ReactComponent as NorthAmerica } from "../../assets/GeoMap/continents/north-america.svg";
import { ReactComponent as SouthAmerica } from "../../assets/GeoMap/continents/south-america.svg";
import { ReactComponent as Asia } from "../../assets/GeoMap/continents/asia.svg";
import { ReactComponent as Australia } from "../../assets/GeoMap/continents/australia.svg";

const continentSVGs = continent => {
  switch (continent) {
    case "Nordamerika": {
      return <NorthAmerica />;
    }
    case "Europa": {
      return <Europe />;
    }
    case "Asien": {
      return <Asia />;
    }
    case "Australien": {
      return <Australia />;
    }
    case "Afrika": {
      return <Africa />;
    }
    case "Südamerika": {
      return <SouthAmerica />;
    }
    default:
      return <Europe />;
  }
};
const mapLongToWidth = (width, continent, lon) => {
  return (
    ((lon - continent.longMin) * width) /
    (continent.longMax - continent.longMin)
  );
};

const distanceToEquator = lat => Math.asinh(Math.tan(lat * (Math.PI / 180)));
const mapLatToHeight = (height, continent, lat) =>
  ((distanceToEquator(lat) - distanceToEquator(continent.latMin)) * height) /
  Math.abs(
    distanceToEquator(continent.latMax) - distanceToEquator(continent.latMin)
  );

export default class GeoMapView extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    const {
      institutions,
      continents,
      continentConnections,
      mfn,
      height,
      width
    } = this.props;
    if (isNaN(height) || !continents) {
      return <div />;
    }

    const arcHeight = height * 0.45;
    return (
      <div
        className={style.geoMapWrapper}
        style={{ width: width, height: height }}
        data-intro="In der Ansicht <b>RAUM</b> wird eine weitere internationale Perspektive auf Drittmittelprojekte ermöglicht. <b>Forschungsprojekte </b> werden als <b>Bögen</b> zwischen Kontinenten visualisiert. Hierdurch tritt die internationale Kooperation, die in vielen Projekten stattfindet, in den Vordergrund. Der grüne Punkt repräsentiert hier das Museum für Naturkunde, welches den Ausgang für jedes Projekt bildet."
        data-step="1"
      >
        <span className={style.plotTitle}>
          <br /> Forschungsprojekte nach Kooperationen
        </span>
        <div className={style.arcWrapper}>
          <svg width={width} height={arcHeight}>
            {Object.values(continentConnections).map((con, i) => (
              <path
                d={`M${con.end * width},${arcHeight} C${con.end *
                  width},${arcHeight -
                  Math.abs(con.end - con.start) * 0.57 * width} ${con.start *
                  width},${arcHeight -
                  Math.abs(con.end - con.start) * 0.57 * width} ${con.start *
                  width},${arcHeight}`}
                stroke="white"
                strokeWidth={Math.max(3, con.weight * 0.5)}
                fill="none"
                opacity={0.4}
                className={style.arcHover}
                key={JSON.stringify([con.start, con.end])}
                onClick={() => {
                  this.props.showInstDetails(con.name);
                }}
              />
            ))}
          </svg>
        </div>
        <div className={style.mapsWrapper}>
          {continents
            .filter(c => c.institutionCount > 0)
            .map(c => {
              const instititutionsOnContinent = Object.values(
                institutions
              ).filter(ins => ins.continent === c.name);
              return (
                <div className={style.continentWrapper} key={c.name}>
                  <svg viewBox={"0 0 500 120"}>
                    <text
                      fill="#aaa"
                      x="50%"
                      y="100"
                      fontSize="400%"
                      key={c.name}
                      textAnchor="middle"
                    >
                      {c.name}
                    </text>
                  </svg>
                  <svg viewBox={"0 0 500 500"}>
                    <g fill={"#aaa"}>{continentSVGs(c.name)}</g>
                    <g
                      transform={`translate(${c.xOffset}, ${c.yOffset})`}
                      fill="transparent"
                    >
                      {instititutionsOnContinent.map(ins => (
                        <circle
                          fill={ins.id === mfn.id ? "#afca0b" : "red"}
                          stroke="red"
                          cx={mapLongToWidth(c.mapWidth, c, ins.lon)}
                          cy={
                            c.mapHeight -
                            mapLatToHeight(c.mapHeight, c, ins.lat)
                          }
                          r={5}
                          key={ins.name + ins.id}
                          className={style.circle}
                        />
                      ))}
                    </g>
                  </svg>
                </div>
              );
            })}
        </div>{" "}
        <span className={style.plotTitle}>
          {" "}
          Forschungsprojekte nach Forschungsregionen (Geographische
          Verschlagwortung)
        </span>
        <div className={style.mapsWrapper}>
          {continents.map((c, i) => {
            return (
              <svg width="16.66%" height="100" key={i + "region"}>
                <circle
                  cx="50%"
                  cy="50%"
                  r={Math.min(40, c.institutionCount)}
                  fill="#aaa"
                />
              </svg>
            );
          })}
        </div>
      </div>
    );
  }
}

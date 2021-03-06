import React, { Component } from "react";
import "d3-transition";
// Import the D3 libraries we'll be using for the stacked area chart.
import {
  scaleLinear as d3ScaleLinear,
  scaleTime as d3ScaleTime
} from "d3-scale";
import {
  area as d3area,
  stack as d3stack,
  stackOrderNone as d3StackOrderNone,
  stackOffsetNone as d3StackOffsetNone
} from "d3-shape";
// Import the D3 libraries we'll use for the axes.
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from "d3-axis";
import { select as d3Select } from "d3-selection";
import styles from "./time-line-view.module.css";
import { getFieldColor, fieldsIntToString } from "../../util/utility";
import SVGWithMargin from "./SVGWithMargin";
import HoverPopover from "../HoverPopover/HoverPopover";
import CategoryBuckets from "./CategoryBuckets";
import InteractionHandler from "../../util/interaction-handler";

export default class TimeLineView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSplitYears: {
        areaChartData: [{ Sonstige: 0, year: 2020, projects: [] }],
        areaChartKeys: ["Sonstige"],
        years: [2006]
      },
      ktasYearBuckets: [],
      height: props.height,
      width: props.width - 15,
      margin: props.margin,
      firstUpdate: true,
      project: {},
      title: "",
      year: "",
      counter: 0,
      index: 0
    };
    this.handleAreaClick = this.handleAreaClick.bind(this);
    this.renderHoverField = this.renderHoverField.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleAreaMouseEnter = this.handleAreaMouseEnter.bind(this);
    this.handlePatternMouseEnter = this.handlePatternMouseEnter.bind(this);
    this.handleCircleMouseEnter = this.handleCircleMouseEnter.bind(this);
  }

  updateTimeGraph(data, height, width, margin) {
    if (!this.state.firstUpdate) {
      // workaround for first time scaling
      this.setState({
        height: height,
        width: width - 15,
        margin: margin
      });
    }

    this.setState({
      dataSplitYears: data.dataSplitFbYear,
      ktasYearBuckets: data.ktasYearBuckets,
      projectsData: data.projects,
      firstUpdate: false
    });
  }

  handleAreaClick(year, key) {
    this.props.showYearDetails(year + "|" + key);
  }

  renderHoverField() {
    return (
      this.state.hoveredArea &&
      this.state.mouseLocation && (
        <HoverPopover
          width={"15em"}
          height="20px"
          locationX={this.state.mouseLocation[0]}
          locationY={this.state.mouseLocation[1]}
        >
          <p
            className={styles.popFixer}
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
            <label>
              {this.state.hoveredArea.forschungsbereich
                ? `${this.state.hoveredArea.year}: ${
                    this.state.hoveredArea.count
                  } aktive Projekte in ${fieldsIntToString(
                    this.state.hoveredArea.forschungsbereich
                  )}`
                : this.state.hoveredArea.year
                ? `${this.state.hoveredArea.year}: ${this.state.hoveredArea.count} Wissenstransferaktivitäten mit der Kategorie ${this.state.hoveredArea.category}`
                : `${this.state.hoveredArea.text}`}
            </label>
          </p>
        </HoverPopover>
      )
    );
  }
  /* grid lines in the starry sky viz are highlighted when a circle is hovered. the green line is drawn in a fixed position svg behind the other content */
  highlightGridLine() {
    return (
      this.state.hoveredArea &&
      !this.state.hoveredArea.forschungsbereich &&
      !this.state.hoveredArea.text &&
      this.state.mouseLocation && (
        <svg
          key="highlightedGridline"
          style={{
            height: this.props.height * 0.9,
            width: this.props.width,
            position: "absolute",
            zIndex: -3
          }}
        >
          <line
            x1={this.state.hoveredArea.x + "px"}
            y1="0%"
            x2={this.state.hoveredArea.x + "px"}
            y2="100%"
            stroke="#afca0b"
          />
        </svg>
      )
    );
  }
  /* same goes for the gridlines drawn in grey for every year in which ktas with a category have been dated */
  renderGridline(lines) {
    return (
      <svg
        key="gridline"
        style={{
          height: this.props.height * 0.9,
          width: this.props.width,
          position: "absolute",
          zIndex: -1
        }}
      >
        {lines.map((line, i) => (
          <line
            x1={line + this.state.margin + "px"}
            y1="0px"
            x2={line + this.state.margin + "px"}
            y2="100%"
            stroke="#fff2"
            fill="none"
            key={i}
          />
        ))}
      </svg>
    );
  }

  handleAreaMouseEnter(year, count, fb, evt) {
    this.setState({
      hoveredArea: {
        year: year,
        forschungsbereich: fb,
        count: count
      },
      mouseLocation: [evt.nativeEvent.clientX, evt.nativeEvent.clientY]
    });
  }

  handlePatternMouseEnter(evt) {
    this.setState({
      hoveredArea: {
        text: "Unsichere Datenlage"
      },
      mouseLocation: [evt.nativeEvent.clientX, evt.nativeEvent.clientY]
    });
  }

  handleCircleMouseEnter(circle, evt) {
    this.setState({
      hoveredArea: circle,
      mouseLocation: [evt.nativeEvent.clientX, evt.nativeEvent.clientY]
    });
  }

  handleMouseLeave() {
    this.setState({ hoveredArea: undefined });
  }

  render() {
    if (this.state.dataSplitYears.length === 0) {
      return <div />;
    }
    const stackedAreaHeight = this.state.height * 0.4;
    const categoriesHeight = this.state.height * 0.5;

    // turns the preprocessed data into a d3 stack
    const stack = d3stack()
      .keys(this.state.dataSplitYears.areaChartKeys)
      .order(d3StackOrderNone)
      .offset(d3StackOffsetNone);
    const stackedData = stack(this.state.dataSplitYears.areaChartData);
    const { areKtaRendered, isTouchMode } = this.props;
    const color = d => {
      return getFieldColor(d.key);
    };
    const toYear = int => {
      return new Date(int.toString()).setHours(0, 0, 0, 0);
    };
    const maxProjects = Math.max(
      ...this.state.dataSplitYears.areaChartData
        .map(year => year.projects.length)
        .flat()
    );
    const minYear = toYear(2006);
    const maxYear = toYear(2025);

    const x = d3ScaleTime()
      .range([0, this.state.width])
      .domain([minYear, maxYear]);

    const y = d3ScaleLinear()
      .range([20, stackedAreaHeight])
      .domain([maxProjects, 0]);

    // Add an axis for our x scale which has half as many ticks as there are rows in the data set.
    const xAxis = d3AxisBottom()
      .scale(x)
      .ticks(this.state.dataSplitYears.years.length / 2);

    // Add an axis for our y scale that has 4 ticks
    const yAxis = d3AxisLeft()
      .scale(y)
      .ticks(4);

    const area = d3area()
      .x(d => x(toYear(d.data.year)))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    //all years with wta in category in one array
    const ktasYears = [].concat.apply(
      [],
      Object.values(this.state.ktasYearBuckets)
    );

    //getting all distinct years that have category bucket
    const lines = [...new Set(ktasYears.map(line => x(toYear(line.year))))];

    return (
      <div
        data-intro="In der Ansicht <b>ZEIT</b> wird eine weitere integrative Perspektive auf die Verläufe von Wissenstransferaktivitäten und Drittmittelprojekten über die Jahre dargestellt. Hierdurch können zum Beispiel Trends gefunden werden, welche in der Planung von Wissentransfer berücksichtigt werden könnten."
        data-step="1"
        style={{ height: "auto", marginLeft: this.state.margin * 0.8 }}
      >
        <div
          data-intro="Durch diese Ansicht auf <b>Wissenstransferaktivitäten</b> und <b>Drittmittelprojekte</b> wird ermöglicht, beide Elemente des Museums für Naturkunde integrativ und längerfristig zu betrachten."
          data-step="4"
        >
          {areKtaRendered && (
            <>
              {this.renderGridline(lines)}
              {this.highlightGridLine()}

              <div
                data-intro="Im oberen Teil dieser Ansicht werden Wissenstransferaktivitäten gruppiert nach <b>Zielgruppen</b> bzw. <b>Formaten</b> angezeigt. Die Größe der Kreise deutet die Menge an Aktivitäten mit einer bestimmten Zielgruppe oder einem bestimmten Format in einem Jahr an. Hierdurch werden längerfristige Perspektiven auf Wissenstransfer ermöglicht."
                data-step="2"
                className={styles.ktaBucketsWrapper}
                style={{ height: categoriesHeight }}
              >
                <span className={styles.plotTitle}>
                  Wissenstransferaktivitäten <br />
                  <br />
                </span>
                <CategoryBuckets
                  ktasYearBuckets={this.state.ktasYearBuckets}
                  height={this.state.height * 0.03}
                  width={this.state.width}
                  showYearDetails={this.props.showYearDetails}
                  fullHeight={this.state.height}
                  xScale={year =>
                    x(new Date(year.toString()).setHours(0, 0, 0, 0)) +
                    this.state.margin
                  }
                  handleCircleMouseEnter={this.handleCircleMouseEnter}
                  handleMouseLeave={this.handleMouseLeave}
                />
              </div>
            </>
          )}

          <SVGWithMargin
            data-intro="Im unteren Teil werden die Anzahl und Laufzeiten von <b>Drittmittelprojekten</b> basierend auf aktuellen Informationen aus dem <b style='color: #afca0b;'>VIA-Wiki</b> und gruppiert nach <b>Forschungsgebieten</b> angezeigt. Der gemusterte Bereich zeigt hierbei an, dass noch nicht alle tatsächlich am MfN laufenden Projekte in dem VIA Wiki Datensatz vorliegen und unterstützt somit die Interpretation der Entwicklung der Forschungsgebiete."
            data-step="3"
            className={styles.timelineContainer}
            contentContainerBackgroundRectClassName={
              styles.timelineContentContainerBackgroundRect
            }
            contentContainerGroupClassName={styles.timelineContentContainer}
            height={stackedAreaHeight}
            margin={this.state.margin}
            width={this.state.width}
          >
            {areKtaRendered && (
              <text
                fill="#717071"
                x={-this.state.margin}
                y="5px"
                fontSize="130%"
              >
                Forschungsprojekte
              </text>
            )}
            {!areKtaRendered && (
              <text
                fill="#717071"
                x={this.state.margin}
                y="5px"
                fontSize="130%"
              >
                Anzahl Projekte je Forschungsgebiet pro Jahr
              </text>
            )}
            {/* a transform style prop to our xAxis to translate it to the bottom of the SVG's content. */}
            <g
              className={styles.xAxis}
              ref={node => d3Select(node).call(xAxis)}
              style={{
                transform: `translateY(${stackedAreaHeight}px)`
              }}
            />
            <g
              className={styles.yAxis}
              ref={node => d3Select(node).call(yAxis)}
            />
            <g>
              <pattern
                id="pattern-circles"
                x={(x(toYear(2018)) - x(toYear(2017))) / 8}
                y="0"
                width={(x(toYear(2018)) - x(toYear(2017))) / 2}
                height={(x(toYear(2018)) - x(toYear(2017))) / 2}
                patternUnits="userSpaceOnUse"
                patternContentUnits="userSpaceOnUse"
              >
                <circle
                  id="pattern-circle"
                  cx={(x(toYear(2018)) - x(toYear(2017))) / 8}
                  cy={(x(toYear(2018)) - x(toYear(2017))) / 8}
                  r="1"
                  fill="#e8e8e8"
                />
                <circle
                  id="pattern-circle"
                  cx={(3 * (x(toYear(2018)) - x(toYear(2017)))) / 8}
                  cy={(x(toYear(2018)) - x(toYear(2017))) / 8}
                  r="1"
                  fill="#989898"
                />
                <circle
                  id="pattern-circle"
                  cx={(3 * (x(toYear(2018)) - x(toYear(2017)))) / 8}
                  cy={(3 * (x(toYear(2018)) - x(toYear(2017)))) / 8}
                  r="1"
                  fill="#e8e8e8"
                />
                <circle
                  id="pattern-circle"
                  cx={(x(toYear(2018)) - x(toYear(2017))) / 8}
                  cy={(3 * (x(toYear(2018)) - x(toYear(2017)))) / 8}
                  r="1"
                  fill="#989898"
                />
              </pattern>
              <InteractionHandler
                onMouseOver={event => this.handlePatternMouseEnter(event)}
                onMouseLeave={() => this.handleMouseLeave()}
                onClick={event => this.handlePatternMouseEnter(event)}
                doubleTapTreshold={800}
              >
                <rect
                  fill="url(#pattern-circles)"
                  x={x(toYear(2018))}
                  y={y(maxProjects)}
                  width={x(maxYear) - x(toYear(2018))}
                  height={y(0) - y(maxProjects)}
                />
              </InteractionHandler>
            </g>

            {stackedData &&
              stackedData.map((d, i) => {
                return (
                  <g key={d.key}>
                    <path
                      style={{ fill: color(d), transition: "d 1s" }}
                      d={area(d)}
                    />
                    {d.map(datum => {
                      return (
                        y(datum[1]) && (
                          <InteractionHandler
                            isInTouchMode={isTouchMode}
                            onClick={event =>
                              this.handleAreaClick(datum.data.year, d.key)
                            }
                            onMouseOver={event =>
                              this.handleAreaMouseEnter(
                                datum.data.year,
                                datum[1] - datum[0],
                                d.key,
                                event
                              )
                            }
                            onMouseLeave={() => this.handleMouseLeave()}
                            doubleTapTreshold={500}
                            key={datum.data.year + " " + d.key}
                          >
                            <line
                              className={styles.stackedAreaHover}
                              x1={x(toYear(datum.data.year))}
                              y1={y(datum[0])}
                              x2={x(toYear(datum.data.year))}
                              y2={y(datum[1])}
                            />
                          </InteractionHandler>
                        )
                      );
                    })}
                  </g>
                );
              })}
          </SVGWithMargin>
          {this.renderHoverField()}
        </div>
      </div>
    );
  }
}

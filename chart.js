async function drawChart() {

  // 1. Access data
  const dataset = await d3.csv("./storm.csv")

  const utcParse = d3.utcParse("%Y-%m-%dT%H:%M:%SZ")
// console.log(utcParse(data[0].data_wind[0].ISO_TIME))
// console.log(data[0].data_wind[0].ISO_TIME)
// console.log(utcParse('1987-01-01T00:00:00Z'))
  const xAccessor = d => utcParse(d.map_date)
  const yAccessor = d => +d.USA_WIND
  const colorAccessor = d => +d.avg_level
  const yearAccessor = d => +d.year
  // const dateAccessor = d => dateParser(d.ISO_TIME)
  
  let data =d3.groups(dataset, d => d.SID).map(([SID, data_wind]) => {return {SID, data_wind}})
  // .map(([n,year_data]) => {return {n, year_data: Object.fromEntries(year_data)}})
  // data = [data[0]]
  console.log(data)

  // const data = ready_data[7][1].map(([name, data_wind]) => {return {name, data_wind}})


  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: window.innerHeight* 1.5,
    margin: {
      top: 15,
      right: 150,
      bottom: 40,
      left: 100,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${
        dimensions.margin.left
      }px, ${
        dimensions.margin.top
      }px)`)

  // 4. Create scales
  const yearScale = d3.scaleBand()
                    .domain(d3.range(1980, 2021))
                    .range([dimensions.margin.top, dimensions.boundedHeight])
  //* x: map_date
  const xScale = d3.scaleUtc()
                  .domain([utcParse('2000-06-01T00:00:00Z'),utcParse('2000-12-30T00:00:00Z')])
                  .range([dimensions.margin.left, dimensions.boundedWidth])
  //* y:wind speed
  const yScale = d3.scaleLinear()
                  .domain([11, 190])
                  .range([yearScale.bandwidth(), 0])

  //* color: avg_level
  const colorScale = d3.scaleThreshold(d3.range(-4, 6), d3.schemeRdBu[10])

  const area = d3.area()
            .curve(d3.curveBasis)
            .x(d => xScale(xAccessor(d)))
            .y0(yScale(0))
            .y1(d => yScale(yAccessor(d)))
  const line = d3.line()
        // .defined(d => !isNaN(d.value))
        .curve(d3.curveBasis)
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))

  // 5. Draw data
  const wind = bounds.selectAll("g")
                  .data(data)
                  .join('g')
                  .attr('class', "storm")
                    .attr('transform', d =>`translate(0,${yearScale(yearAccessor(d.data_wind[0]))})`)
                    // console.log(xAccessor(data[0].data_wind[0]))
// console.log(colorAccessor(data[0].data_wind[0]))
console.log(data[0].data_wind)


//? explanation for color here
// let [hah] = data[0].data_wind // here: i only got the first item of the array.其实还是91个object(array item)中的第一个。是data_wind[0]这个array里的第一个item，who happens to be an object
// console.log(hah)
// let {avg_level} = hah
// console.log(avg_level)
//! area chart
  const path_selection = wind.append('path')
      .datum(d => d.data_wind)
      .attr('fill', d => {
          //其实不是整个array,不是每组的那整个datum data 的avg,只是去了每组，每个array,里的第一个item,然后access that item(object)'s avg_level
        const [{avg_level}] = d
        
        return colorScale(avg_level)
      })
      .style('opacity', 0.5)
      .attr("d", area)
      
  
//! added line on top
  wind.append('path')
      .datum(d => d.data_wind)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#01356e")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")


  // 6. Draw peripherals



  // 7. Interaction


}


drawChart()
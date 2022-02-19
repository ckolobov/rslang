import Component from './Component';
import '../../scss/components/_graph.scss';
import * as d3 from 'd3';

interface GraphOptions {
  dateList: string[], 
  sprintNewWords: number[], 
  sprintGuess: number[],
  sprintTotal: number[], 
  sprintLearnedWords: number[], 
  sprintRow: number[]
}
class Graph implements Component {
  private options: GraphOptions;

  public constructor(options: GraphOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    console.log('нажали');
    const width = 800;
    const height = 500;
    const margin = 30;
    const data: object[] = [];
    const svg = d3.select('#all_time_statistics_container').append('svg').attr('class', 'axis').attr('width', width).attr('height', height);
    const xAxisLength = width - 2 * margin;
    const yAxisLength = height - 2 * margin;
    const scaleX = d3.scaleTime().domain([new Date(2022,1,1), new Date()]).range([0, xAxisLength]);
    const scaleY = d3.scaleLinear().domain([Math.max.apply(null, this.options.sprintNewWords)*1.2,0]).range([0, yAxisLength]); //1.2 - чтобы график не упирался в верх.границу
    for (let i=0; i<this.options.dateList.length; i+=1) {
      const dF = this.options.dateList[i];
      const y = this.options.sprintNewWords[i];
      data.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y)+margin});
    }
    const xAxis = d3.axisBottom(scaleX).tickFormat(d3.timeFormat('%d-%m-%Y'));
    const yAxis = d3.axisLeft(scaleY);
    svg.append('g').attr('class', 'x-axis').attr('transform' , 'translate(' + margin + ',' + (height - margin) + ')').call(xAxis);
    svg.append('g').attr('class', 'y-axis').attr('transform' , 'translate(' + margin + ',' + margin + ')').call(yAxis);
    d3.selectAll('g.x-axis g.tick').append('line').classed('grid-line', true).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', -(yAxisLength));
    d3.selectAll('g.y-axis g.tick').append('line').classed('grid-line', true).attr('x1', 0).attr('y1', 0).attr('x2', xAxisLength).attr('y2', 0);
    const line = d3.line().curve(d3.curveMonotoneX).x(function(d){return d.x;}).y(function(d){return d.y;});
    svg.append('g').append('path').attr('d', line(data)).style('stroke', 'steelblue').style('stroke-width', 2);
    svg.selectAll(".dot").data(data).enter().append("circle").attr("class", "dot").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    const view = `
      ${(document.querySelector('.axis') as SVGElement).outerHTML}
    `;
    return view;
  }


  public async after_render(): Promise<any> {
    // const width = 800;
    // const height = 500;
    // const margin = 30;
    // const data: object[] = [];
    // const svg = d3.select('#all_time_statistics_container').append('svg').attr('class', 'axis').attr('width', width).attr('height', height);
    // const xAxisLength = width - 2 * margin;
    // const yAxisLength = height - 2 * margin;
    // const scaleX = d3.scaleTime().domain([new Date(2022,1,1), new Date()]).range([0, xAxisLength]);
    // const scaleY = d3.scaleLinear().domain([Math.max.apply(null, this.options.sprintNewWords)*1.2,0]).range([0, yAxisLength]); //1.2 - чтобы график не упирался в верх.границу
    // for (let i=0; i<this.options.dateList.length; i+=1) {
    //   const dF = this.options.dateList[i];
    //   const y = this.options.sprintNewWords[i];
    //   data.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y)+margin});
    // }
    // console.log(data);
    // const xAxis = d3.axisBottom(scaleX).tickFormat(d3.timeFormat('%d-%m-%Y'));
    // const yAxis = d3.axisLeft(scaleY);
    // svg.append('g').attr('class', 'x-axis').attr('transform' , 'translate(' + margin + ',' + (height - margin) + ')').call(xAxis);
    // svg.append('g').attr('class', 'y-axis').attr('transform' , 'translate(' + margin + ',' + margin + ')').call(yAxis);
    // d3.selectAll('g.x-axis g.tick').append('line').classed('grid-line', true).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', -(yAxisLength));
    // d3.selectAll('g.y-axis g.tick').append('line').classed('grid-line', true).attr('x1', 0).attr('y1', 0).attr('x2', xAxisLength).attr('y2', 0);
    // const line = d3.line().curve(d3.curveMonotoneX).x(function(d){return d.x;}).y(function(d){return d.y;});
    // svg.append('g').append('path').attr('d', line(data)).style('stroke', 'steelblue').style('stroke-width', 2);
    // svg.selectAll(".dot").data(data).enter().append("circle").attr("class", "dot").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    // console.log(svg);
    // console.log(svg.toString());
    return ;
  }
}

export default Graph;

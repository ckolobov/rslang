import '../../scss/components/_graph.scss';
import * as d3 from 'd3';

interface GraphOptions {
  dateList: string[],
  sprintPlayedGames?: number[],
  sprintNewWords?: number[],
  sprintGuess?: number[],
  sprintTotal?: number[],
  sprintLearnedWords?: number[],
  sprintRow?: number[],
  audioChallengePlayedGames?: number[],
  audioChallengeNewWords?: number[],
  audioChallengeGuess?: number[],
  audioChallengeTotal?: number[],
  audioChallengeLearnedWords?: number[],
  audioChallengeRow?: number[],
  pexesoOCMPlayedGames?: number[],
  pexesoOCMNewWords?: number[],
  pexesoOCMGuess?: number[],
  pexesoOCMTotal?: number[],
  pexesoOCMLearnedWords?: number[],
  pexesoOCMRow?: number[],
  hangmanPlayedGames?: number[],
  hangmanGuess?: number[],
  hangmanTotal?: number[],
  pexesoCCMPlayedGames?: number[],
  pexesoCCMGuess?: number[],
  pexesoCCMTotal?: number[],
}
class Graph {
  private options: GraphOptions;

  public constructor(options: GraphOptions) {
    this.options = options;
  }

  public async render(game_type: string, stat_type: string): Promise<void> {
    const graphSection = document.getElementById('all_time_statistics_container') as HTMLElement;
    const graphCount = Object.keys(graphSection.children).length - 3
    for (let i=0; i<graphCount; i+=1) {
      (graphSection.lastChild as SVGElement).remove()
    }
    let axisYdata:number[] = [];
    let axisYdata1:number[] = [];
    let axisYdata2:number[] = [];
    let axisYdata3:number[] = [];
    let axisYdata4:number[] = [];
    if (game_type === '-1') {
      if (stat_type === '0') {
        axisYdata = this.options.sprintPlayedGames||[];
        axisYdata1 = this.options.audioChallengePlayedGames||[];
        axisYdata2 = this.options.pexesoOCMPlayedGames||[];
        axisYdata3 = this.options.hangmanPlayedGames||[];
        axisYdata4 = this.options.pexesoCCMPlayedGames||[];
      }
      if (stat_type === '1') {
        axisYdata = this.options.sprintLearnedWords||[];
        axisYdata1 = this.options.audioChallengeLearnedWords||[];
        axisYdata2 = this.options.pexesoOCMLearnedWords||[];
      }
      if (stat_type === '2') {
        for (let i=0; i<(this.options.sprintTotal||[]).length; i+=1) {
          axisYdata[i]=(100 * (this.options.sprintGuess||[])[i]/(this.options.sprintTotal||[])[i])||0;
          axisYdata1[i]=(100 * (this.options.audioChallengeGuess||[])[i]/(this.options.audioChallengeTotal||[])[i])||0;
          axisYdata2[i]=(100 * (this.options.pexesoOCMGuess||[])[i]/(this.options.pexesoOCMTotal||[])[i])||0;
          axisYdata3[i]=(100 * (this.options.hangmanGuess||[])[i]/(this.options.hangmanTotal||[])[i])||0;
          axisYdata4[i]=(100 * (this.options.pexesoCCMGuess||[])[i]/(this.options.pexesoCCMTotal||[])[i])||0;
        }
      }
      if (stat_type === '3') {
        axisYdata = this.options.sprintRow||[];
        axisYdata1 = this.options.audioChallengeRow||[];
        axisYdata2 = this.options.pexesoOCMRow||[];
      }
      if (stat_type === '4') {
        axisYdata = this.options.sprintNewWords||[];
        axisYdata1 = this.options.audioChallengeNewWords||[];
        axisYdata2 = this.options.pexesoOCMNewWords||[];
      }
    }
    if (game_type === '0') {
      if (stat_type === '0') axisYdata = this.options.sprintPlayedGames||[];
      if (stat_type === '1') axisYdata = this.options.sprintLearnedWords||[];
      if (stat_type === '2') {
        for (let i=0; i<(this.options.sprintTotal||[]).length; i+=1) {
          axisYdata[i]=(100 * (this.options.sprintGuess||[])[i]/(this.options.sprintTotal||[])[i])||0;
        }
      }
      if (stat_type === '3') axisYdata = this.options.sprintRow||[];
      if (stat_type === '4') axisYdata = this.options.sprintNewWords||[];
    }
    if (game_type === '1') {
      if (stat_type === '0') axisYdata1 = this.options.audioChallengePlayedGames||[];
      if (stat_type === '1') axisYdata1 = this.options.audioChallengeLearnedWords||[];
      if (stat_type === '2') {
        for (let i=0; i<(this.options.audioChallengeTotal||[]).length; i+=1) {
          axisYdata1[i]=(100 * (this.options.audioChallengeGuess||[])[i]/(this.options.audioChallengeTotal||[])[i])||0;
        }
      }
      if (stat_type === '3') axisYdata1 = this.options.audioChallengeRow||[];
      if (stat_type === '4') axisYdata1 = this.options.audioChallengeNewWords||[];
    }
    if (game_type === '2') {
      if (stat_type === '0') axisYdata2 = this.options.pexesoOCMPlayedGames||[];
      if (stat_type === '1') axisYdata2 = this.options.pexesoOCMLearnedWords||[];
      if (stat_type === '2') {
        for (let i=0; i<(this.options.pexesoOCMTotal||[]).length; i+=1) {
          axisYdata2[i]=(100 * (this.options.pexesoOCMGuess||[])[i]/(this.options.pexesoOCMTotal||[])[i])||0;
        }
      }
      if (stat_type === '3') axisYdata2 = this.options.pexesoOCMRow||[];
      if (stat_type === '4') axisYdata2 = this.options.pexesoOCMNewWords||[];
    }
    if (game_type === '3') {
      if (stat_type === '0') axisYdata3 = this.options.hangmanPlayedGames||[];
      if (stat_type === '2') {
        for (let i=0; i<(this.options.hangmanTotal||[]).length; i+=1) {
          axisYdata3[i]=(100 * (this.options.hangmanGuess||[])[i]/(this.options.hangmanTotal||[])[i])||0;
        }
      }
    }
    if (game_type === '4') {
      if (stat_type === '0') axisYdata4 = this.options.pexesoCCMPlayedGames||[];
      if (stat_type === '2') {
        for (let i=0; i<(this.options.pexesoCCMTotal||[]).length; i+=1) {
          axisYdata4[i]=(100 * (this.options.pexesoCCMGuess||[])[i]/(this.options.pexesoCCMTotal||[])[i])||0;
        }
      }
    }

    const width = 800;
    const height = 400;
    const margin = 30;
    const data: object[] = [];
    const data1: object[] = [];
    const data2: object[] = [];
    const data3: object[] = [];
    const data4: object[] = [];
    const svg = d3.select('#all_time_statistics_container').append('svg').attr('class', 'axis').attr('width', width).attr('height', height);
    const xAxisLength = width - 2 * margin;
    const yAxisLength = height - 2 * margin;
    const scaleX = d3.scaleTime().domain([new Date(2022,1,1), new Date()]).range([0, xAxisLength]);
    const max = Math.max(Math.max.apply(null, axisYdata),Math.max.apply(null, axisYdata1), Math.max.apply(null, axisYdata2), Math.max.apply(null, axisYdata3), Math.max.apply(null, axisYdata4));
    const scaleY = d3.scaleLinear().domain([max*1.2,0]).range([0, yAxisLength]); //1.2 - чтобы график не упирался в верх.границу
    for (let i=0; i<this.options.dateList.length; i+=1) {
      const dF = this.options.dateList[i];
      const y = axisYdata[i];
      const y1 = axisYdata1[i];
      const y2 = axisYdata2[i];
      const y3 = axisYdata3[i];
      const y4 = axisYdata4[i];
      data.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y)+margin});
      data1.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y1)+margin});
      data2.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y2)+margin});
      data3.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y3)+margin});
      data4.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y4)+margin});
    }
    const xAxis = d3.axisBottom(scaleX).tickFormat(d3.timeFormat('%d-%m-%Y'));
    const yAxis = d3.axisLeft(scaleY);
    svg.append('g').attr('class', 'x-axis').attr('transform' , 'translate(' + margin + ',' + (height - margin) + ')').call(xAxis);
    svg.append('g').attr('class', 'y-axis').attr('transform' , 'translate(' + margin + ',' + margin + ')').call(yAxis);
    d3.selectAll('g.x-axis g.tick').append('line').classed('grid-line', true).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', -(yAxisLength));
    d3.selectAll('g.y-axis g.tick').append('line').classed('grid-line', true).attr('x1', 0).attr('y1', 0).attr('x2', xAxisLength).attr('y2', 0);
    const line = d3.line().curve(d3.curveMonotoneX).x(function(d){return d.x;}).y(function(d){return d.y;});
    if (axisYdata.length !== 0){
      svg.append('g').append('path').attr('d', line(data)).style('stroke', 'steelblue').style('stroke-width', 2);
      svg.selectAll(".dot").data(data).enter().append("circle").attr("class", "dot").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (axisYdata1.length !== 0){
      svg.append('g').append('path').attr('d', line(data1)).style('stroke', 'red').style('stroke-width', 2);
      svg.selectAll(".dot1").data(data1).enter().append("circle").attr("class", "dot1").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (axisYdata2.length !== 0){
      svg.append('g').append('path').attr('d', line(data2)).style('stroke', 'green').style('stroke-width', 2);
      svg.selectAll(".dot2").data(data2).enter().append("circle").attr("class", "dot2").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (axisYdata3.length !== 0){
    svg.append('g').append('path').attr('d', line(data3)).style('stroke', 'blue').style('stroke-width', 2);
    svg.selectAll(".dot3").data(data3).enter().append("circle").attr("class", "dot3").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (axisYdata4.length !== 0){
    svg.append('g').append('path').attr('d', line(data4)).style('stroke', 'yellow').style('stroke-width', 2);
    svg.selectAll(".dot4").data(data4).enter().append("circle").attr("class", "dot4").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (stat_type === '2') {
      svg.append('g').append('text').attr("x", margin).attr("y", margin - 11).attr("text-anchor", "end").text("%");
    }
  }
}

export default Graph;

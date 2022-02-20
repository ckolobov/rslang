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
  textbookLearnedWords?: number[],
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
    let axisYdata5:number[] = [];
    let axisYdata6:number[] = [];
    if (game_type === '-1') {
      if (stat_type === '0') {
        axisYdata = this.options.sprintPlayedGames||[];
        axisYdata1 = this.options.audioChallengePlayedGames||[];
        axisYdata2 = this.options.pexesoOCMPlayedGames||[];
        axisYdata3 = this.options.hangmanPlayedGames||[];
        axisYdata4 = this.options.pexesoCCMPlayedGames||[];
        axisYdata6 = axisYdata.map(function(v, i) {return v + axisYdata1[i] + axisYdata2[i] + axisYdata3[i] + axisYdata4[i]});
      }
      if (stat_type === '1') {
        axisYdata = this.options.sprintLearnedWords||[];
        axisYdata1 = this.options.audioChallengeLearnedWords||[];
        axisYdata2 = this.options.pexesoOCMLearnedWords||[];
        axisYdata5 = this.options.textbookLearnedWords||[];
        axisYdata6 = axisYdata.map(function(v, i) {return v + axisYdata1[i] + axisYdata2[i] + axisYdata5[i]});
      }
      if (stat_type === '1.5') {
        axisYdata = (this.options.sprintLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        axisYdata1 = (this.options.audioChallengeLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        axisYdata2 = (this.options.pexesoOCMLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        axisYdata5 = (this.options.textbookLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        axisYdata6 = axisYdata.map(function(v, i) {return v + axisYdata1[i] + axisYdata2[i] + + axisYdata5[i]}).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
      }
      if (stat_type === '2') {
        for (let i=0; i<(this.options.sprintTotal||[]).length; i+=1) {
          axisYdata[i]=(100 * (this.options.sprintGuess||[])[i]/(this.options.sprintTotal||[])[i])||0;
          axisYdata1[i]=(100 * (this.options.audioChallengeGuess||[])[i]/(this.options.audioChallengeTotal||[])[i])||0;
          axisYdata2[i]=(100 * (this.options.pexesoOCMGuess||[])[i]/(this.options.pexesoOCMTotal||[])[i])||0;
          axisYdata3[i]=(100 * (this.options.hangmanGuess||[])[i]/(this.options.hangmanTotal||[])[i])||0;
          axisYdata4[i]=(100 * (this.options.pexesoCCMGuess||[])[i]/(this.options.pexesoCCMTotal||[])[i])||0;
          axisYdata6[i] = (axisYdata[i] + axisYdata1[i] + axisYdata2[i])/(Number(!!axisYdata[i]) + Number(!!axisYdata1[i]) + Number(!!axisYdata2[i]));
        }
      }
      if (stat_type === '3') {
        axisYdata = this.options.sprintRow||[];
        axisYdata1 = this.options.audioChallengeRow||[];
        axisYdata2 = this.options.pexesoOCMRow||[];
        axisYdata6 = axisYdata.map(function(v, i) {return Math.max(v, axisYdata1[i], axisYdata2[i])});
      }
      if (stat_type === '4') {
        axisYdata = this.options.sprintNewWords||[];
        axisYdata1 = this.options.audioChallengeNewWords||[];
        axisYdata2 = this.options.pexesoOCMNewWords||[];
        axisYdata6 = axisYdata.map(function(v, i) {return v + axisYdata1[i] + axisYdata2[i]});
      }
    }
    if (game_type === '0') {
      if (stat_type === '0') axisYdata = this.options.sprintPlayedGames||[];
      if (stat_type === '1') axisYdata = this.options.sprintLearnedWords||[];
      if (stat_type === '1.5') axisYdata = (this.options.sprintLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
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
      if (stat_type === '1.5') axisYdata1 = (this.options.audioChallengeLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
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
      if (stat_type === '1.5') axisYdata2 = (this.options.pexesoOCMLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
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
    if (game_type === '5') {
      if (stat_type === '1') {
        axisYdata5 = this.options.textbookLearnedWords||[];
      }
      if (stat_type === '1.5') {
        axisYdata5 = (this.options.textbookLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
      }
    }
    if (game_type === '1.9') {
      if (stat_type === '0') {
        const arr1 = this.options.sprintPlayedGames||[];
        const arr2 = this.options.audioChallengePlayedGames||[];
        const arr3 = this.options.pexesoOCMPlayedGames||[];
        const arr4 = this.options.pexesoCCMPlayedGames||[];
        const arr5 = this.options.hangmanPlayedGames||[];
        axisYdata6 = arr1.map(function(v, i) {return v + arr2[i] + arr3[i] + arr4[i] + arr5[i]});
      }
      if (stat_type === '1') {
        const arr1 = this.options.sprintLearnedWords||[];
        const arr2 = this.options.audioChallengeLearnedWords||[];
        const arr3 = this.options.pexesoOCMLearnedWords||[];
        const arr4 = this.options.textbookLearnedWords||[];
        axisYdata6 = arr1.map(function(v, i) {return v + arr2[i] + arr3[i] + arr4[i]});
      }
      if (stat_type === '1.5') {
        const arr1 = (this.options.sprintLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        const arr2 = (this.options.audioChallengeLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        const arr3 = (this.options.pexesoOCMLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        const arr4 = (this.options.textbookLearnedWords||[]).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
        axisYdata6 = arr1.map(function(v, i) {return v + arr2[i] + arr3[i] + arr4[i]}).map((n,i,a)=>eval(a.slice(0,i+1).join('+')));
      }
      if (stat_type === '2') {
        const arr1 = this.options.sprintGuess||[];
        const arr2 = this.options.audioChallengeGuess||[];
        const arr3 = this.options.pexesoOCMGuess||[];
        const totalGuess = arr1.map(function(v, i) {return v + arr2[i] + arr3[i]});
        const arr4 = this.options.sprintTotal||[];
        const arr5 = this.options.audioChallengeTotal||[];
        const arr6 = this.options.pexesoOCMTotal||[];
        const totalTotal = arr4.map(function(v, i) {return v + arr5[i] + arr6[i]});
        for (let i=0; i<(totalTotal||[]).length; i+=1) {
          axisYdata6[i]=(100 * (totalGuess||[])[i]/(totalTotal||[])[i])||0;
        }
      }
      if (stat_type === '3') {
        const arr1 = this.options.sprintRow||[];
        const arr2 = this.options.audioChallengeRow||[];
        const arr3 = this.options.pexesoOCMRow||[];
        axisYdata6 = arr1.map(function(v, i) {return Math.max(v, arr2[i], arr3[i])});
      }
      if (stat_type === '4') {
        const arr1 = this.options.sprintNewWords||[];
        const arr2 = this.options.audioChallengeNewWords||[];
        const arr3 = this.options.pexesoOCMNewWords||[];
        axisYdata6 = arr1.map(function(v, i) {return v + arr2[i] + arr3[i]});
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
    const data5: object[] = [];
    const data6: object[] = [];
    const svg = d3.select('#all_time_statistics_container').append('svg').attr('class', 'axis').attr('width', width).attr('height', height);
    const xAxisLength = width - 2 * margin;
    const yAxisLength = height - 2 * margin;
    const scaleX = d3.scaleTime().domain([new Date(2022,1,1), new Date()]).range([0, xAxisLength]);
    const max = Math.max(Math.max.apply(null, axisYdata),Math.max.apply(null, axisYdata1), Math.max.apply(null, axisYdata2), Math.max.apply(null, axisYdata3), Math.max.apply(null, axisYdata4), Math.max.apply(null, axisYdata5), Math.max.apply(null, axisYdata6));
    const scaleY = d3.scaleLinear().domain([max*1.2,0]).range([0, yAxisLength]); //1.2 - чтобы график не упирался в верх.границу
    for (let i=0; i<this.options.dateList.length; i+=1) {
      const dF = this.options.dateList[i];
      const y = axisYdata[i];
      const y1 = axisYdata1[i];
      const y2 = axisYdata2[i];
      const y3 = axisYdata3[i];
      const y4 = axisYdata4[i];
      const y5 = axisYdata5[i];
      const y6 = axisYdata6[i];
      data.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y)+margin});
      data1.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y1)+margin});
      data2.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y2)+margin});
      data3.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y3)+margin});
      data4.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y4)+margin});
      data5.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y5)+margin});
      data6.push({x: scaleX(new Date(Number(dF.split('-')[2]), Number(dF.split('-')[1]), Number(dF.split('-')[0])))+margin, y: scaleY(y6)+margin});
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
    if (axisYdata5.length !== 0){
      svg.append('g').append('path').attr('d', line(data5)).style('stroke', 'brown').style('stroke-width', 2);
      svg.selectAll(".dot5").data(data5).enter().append("circle").attr("class", "dot5").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (axisYdata6.length !== 0){
      svg.append('g').append('path').attr('d', line(data6)).style('stroke', 'white').style('stroke-width', 3);
      svg.selectAll(".dot6").data(data6).enter().append("circle").attr("class", "dot6").attr("r", 3.5).attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    if (stat_type === '2') {
      svg.append('g').append('text').attr("x", margin).attr("y", margin - 11).attr("text-anchor", "end").text("%");
    }
    const legendTable = d3.select("svg").append("g").attr("class", "legendTable");
    legendTable.append("rect").attr("y", 10).attr("x", 40).attr("width", 10).attr("height", 10).style("fill", 'steelblue');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 55).text("Sprint");
    legendTable.append("rect").attr("y", 10).attr("x", 120).attr("width", 10).attr("height", 10).style("fill", 'red');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 135).text("AudioChallenge");
    legendTable.append("rect").attr("y", 10).attr("x", 240).attr("width", 10).attr("height", 10).style("fill", 'green');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 255).text("Pexeso (open card)");
    legendTable.append("rect").attr("y", 10).attr("x", 380).attr("width", 10).attr("height", 10).style("fill", 'blue');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 395).text("Pexeso (close card)");
    legendTable.append("rect").attr("y", 10).attr("x", 520).attr("width", 10).attr("height", 10).style("fill", 'yellow');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 535).text("Hangman");
    legendTable.append("rect").attr("y", 10).attr("x", 620).attr("width", 10).attr("height", 10).style("fill", 'brown');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 635).text("Textbook");
    legendTable.append("rect").attr("y", 10).attr("x", 725).attr("width", 10).attr("height", 10).style("fill", 'white');
    legendTable.append("text").attr("y", 20).attr("class", "legendtext").attr("x", 740).text("Total");
  }
}

export default Graph;

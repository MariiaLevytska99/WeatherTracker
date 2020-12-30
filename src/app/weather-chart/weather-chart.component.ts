import {AfterViewInit, Component, Input, OnInit, Output} from '@angular/core';
import * as go from 'gojs';
import {Spot} from 'gojs';

const $ = go.GraphObject.make;

@Component({
  selector: 'app-weather-chart',
  templateUrl: './weather-chart.component.html',
  styleUrls: ['./weather-chart.component.css']
})
export class WeatherChartComponent implements OnInit, AfterViewInit {

  @Output()
  public diagram: go.Diagram = null;

  @Input()
  public model: go.Model;


  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.buildGraph();
  }

  buildGraph(): void{
    this.diagram = $(go.Diagram, 'myDiagramDiv',
      {
        autoScale: go.Diagram.Uniform,
        contentAlignment: Spot.Center
      });

    const SPARK_STROKEWIDTH = 5;
    const SPARK_INTERVAL = 25;
    const BASELINE_LENGTH = 40;

    function makeStringFromValues(values): string {
      if (values.length < 1) { return 'M 0 ' + values + ' L ' + BASELINE_LENGTH + ' 0'; }
      let str = 'M 0 ' + Math.round(-values[0] * SPARK_INTERVAL);
      if (values.length < 2) { str += ' L ' + BASELINE_LENGTH * SPARK_INTERVAL + ' ' + Math.round(-values[0] * SPARK_INTERVAL); }


      for (let i = 0; i < values.length; i++) {
        str += 'L ' + Math.round((i + 1) * SPARK_INTERVAL) + ' ' + Math.round(-values[i] * SPARK_INTERVAL);
      }
      return str;
    }

    // determine y offset
    function makeAlignmentFromValues(values): go.Spot {
      let min = Infinity;
      for (let i = 0; i < values.length; i++) {
        min = Math.min(min, values[i]);
      }
      let y = (-min * SPARK_INTERVAL);
      if (min > 0) { y = -SPARK_STROKEWIDTH; } // add the strokeWidth

      return new go.Spot(0, 1, 0, -y);
    }

    const sparkLine = $(go.Panel, 'Horizontal',
      {
        alignment: go.Spot.Center,
        alignmentFocusName: 'spark'
      },

      new go.Binding('alignmentFocus', 'values', makeAlignmentFromValues),

      $(go.TextBlock,
        { visible: false, margin: 1, font: '20px sans-serif', background: 'white' },
        new go.Binding('alignment', 'values', (values) => {
          let min = Infinity;
          let max = -Infinity;
          for (const item of values) {
            min = Math.min(min, item);
            max = Math.max(max, item);
          }
          if (max - min === 0) { return go.Spot.Center; }
          return new go.Spot(0, 1 - Math.abs((values[0] - min) / (max - min)), 0, 0);
        }),
        new go.Binding('stroke', 'color'),
        new go.Binding('text', 'label'),
        new go.Binding('visible', 'label', (l) => true)
      ),

      $(go.Shape, {
          fill: null,
          strokeWidth: SPARK_STROKEWIDTH,
          stroke: 'gray',
          name: 'spark'
        },
        new go.Binding('stroke', 'color'),
        new go.Binding('geometryString', 'values', makeStringFromValues)
      )

    ); // end sparkLine itemTemplate

    this.diagram.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, { fill: 'rgba(200,200,255,.3)', strokeWidth: 0 }),
        $(go.Panel, 'Spot',
          { itemTemplate: sparkLine },
          new go.Binding('itemArray', 'items'),
          $(go.Shape, { width: 1, height: 600, fill: 'red', stroke: null, strokeWidth: 0 })
        )
      );
    this.diagram.model = this.model;
  }

  myCallback(blob): void {
    const url = window.URL.createObjectURL(blob);
    const filename = 'chart.png';

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // tslint:disable-next-line:only-arrow-functions
    requestAnimationFrame(function() {
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  downloadChart(): void {
    const blob = this.diagram.makeImageData({ background: 'white', returnType: 'blob', callback: this.myCallback });
  }

}

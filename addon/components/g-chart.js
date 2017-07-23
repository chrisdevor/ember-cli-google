import Ember from 'ember';
import layout from '../templates/components/g-chart';

export default Ember.Component.extend({
  layout,

  gCharts: Ember.inject.service (),

  mergedProperties: ['chartOptionsMapping', 'packagesOptions'],
  concatenatedProperties: ['packages'],

  packages: [],
  packagesOptions: {},

  // Options that are common across all charts.

  chartOptionsMapping: {
    backgroundColor: 'backgroundColor',
    backgroundColorStroke: 'backgroundColor.stroke',
    backgroundColorStrokeWidth: 'backgroundColor.strokeWidth',
    backgroundColorFill: 'backgroundColor.fill',

    chartArea: 'chartArea',
    chartAreaBackgroundColor: 'chartArea.backgroundColor',
    chartAreaLeft: 'chartArea.left',
    chartAreaTop: 'chartArea.top',
    chartAreaWidth: 'chartArea.width',
    chartAreaHeight: 'chartArea.height',

    colors: 'colors',

    enableInteractivity: 'enableInteractivity',

    fontSize: 'fontSize',
    fontName: 'fontName',

    forceIFrame: 'forceIFrame',

    height: 'height',

    is3D: 'is3D',

    legend: 'legend',
    legendAlignment: 'legend.alignment',
    legendMaxLines: 'legend.maxLines',
    legendPosition: 'legend.position',
    legendTextStyle: 'legend.textStyle',

    title: 'title',
    titlePosition: 'titlePosition',
    titleTextStyle: 'titleTextStyle',

    tooltip: 'tooltip',
    tooltipIgnoreBounds: 'tooltip.ignoreBounds',
    tooltipIsHtml: 'tooltip.isHtml',
    tooltipShowColorCode: 'tooltip.showColorCode',
    tooltipText: 'tooltip.text',
    tooltipTextStyle: 'tooltip.textStyle',
    tooltipTrigger: 'tooltip.trigger',

    width: 'width',
  },

  init () {
    this._super (...arguments);

    this.set ('options', {});
  },

  imageURI: Ember.computed ('chart', function () {
    return this.get ('chart').getImageURI ();
  }),

  selection: Ember.computed ('chart', {
    get (key) {
      return this.get ('chart').getSelection ();
    },

    set (key, value) {
      this.get ('chart').setSelection (value);
    }
  }),

  didReceiveAttrs (changeSet) {
    this._super (...arguments);

    if (Ember.isPresent (changeSet.newAttrs)) {
      // This determine if we need to redraw the chart. We redraw the chart if the
      // data has changed, or one of the chart options has changed.
      let redrawChart = false;

      if (Ember.isPresent (changeSet.newAttrs.data)) {
        redrawChart = true;
      }

      for (let prop in changeSet.newAttrs) {
        let targetChartOption = this.chartOptionsMapping[prop];

        if (Ember.isPresent (targetChartOption)) {
          let value = this.get (prop);
          this.set (`options.${targetChartOption}`, value);

          redrawChart = true;
        }
      }

      if (redrawChart && Ember.isPresent (this.get ('chart'))) {
        this.drawChart ();
      }
    }
  },

  didInsertElement () {
    this._super (...arguments);

    // Request the packages used by the concrete chart.
    let packages = this.get ('packages');
    let packagesOptions = this.get ('packagesOptions');

    this.get ('gCharts').load (packages, packagesOptions,  () => {
      // Instruct the subclass to create the concrete chart object so we can
      // store a reference to it.
      let chart = this.createChart (this.$()[0]);
      this.didCreateChart (chart);

      this.set ('chart', chart);
      this.drawChart ();
    });
  },

  didCreateChart (chart) {
    google.visualization.events.addListener (chart, 'ready', () => { this.onReady (...arguments); });
    google.visualization.events.addListener (chart, 'select', () => { this.didSelect (...arguments); });
    google.visualization.events.addListener (chart, 'error', () => { this.didError (...arguments); });
    google.visualization.events.addListener (chart, 'onmouseover', () => { this.didMouseOver (...arguments); });
    google.visualization.events.addListener (chart, 'onmouseout', () => { this.didMouseOut (...arguments); });
  },

  drawChart () {
    // Prepare the data. If the data object is an array, then we need to convert
    // the data object to a DataTable object. Otherwise, we are going to assume the
    // data is a DataTable or a DataView.
    let data = this.get ('data');

    if (Ember.isArray (data)) {
      data = google.visualization.arrayToDataTable (data);
    }

    let options = this.get ('options') || {};
    this.get ('chart').draw (data, options);
  },
  
  clear () {
    this.get ('chart').clearChart ();
  },

  onReady () {
    let readyHandler = this.get ('ready');

    if (readyHandler) {
      readyHandler (this);
    }
  },

  didError (id, message) {
    let errorHandler = this.get ('error');

    if (errorHandler) {
      errorHandler (this, id, message);
    }
  },

  didSelect () {
    let selectHandler = this.get ('select');

    if (selectHandler) {
      selectHandler (this);
    }
  },

  didMouseOver (row, column) {
    let onMouseOverHandler = this.get ('mouseover');

    if (onMouseOverHandler) {
      onMouseOverHandler (this, row, column);
    }
  },

  didMouseOut (row, column) {
    let onMouseOutHandler = this.get ('mouseout');

    if (onMouseOutHandler) {
      onMouseOutHandler (this, row, column);
    }
  }
});

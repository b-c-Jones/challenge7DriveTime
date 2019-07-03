///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare',
  'dojo/_base/lang',
  "dojo/_base/array",
  'jimu/BaseWidget',
  "esri/map",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "esri/tasks/ServiceAreaTask",
  "esri/tasks/ServiceAreaSolveResult",
  "esri/tasks/ServiceAreaParameters",
  "esri/tasks/FeatureSet",
  "esri/graphic",
  'dijit/form/NumberSpinner',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/domReady!'
], function (declare, lang, array, BaseWidget, Map, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, ServiceAreaTask, ServiceAreaSolveResult, ServiceAreaParameters, FeatureSet, Graphic, NumberSpinner, dom, domConstruct, on) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // Custom widget code goes here

    baseClass: 'jimu-widget-Challenge7DriveTime',

    //this property is set by the framework when widget is loaded.
    //name: 'CustomWidget',


    //methods to communication with app container:

    // postCreate: function() {
    //   this.inherited(arguments);
    //   console.log('postCreate');
    // },

    startup: function () {
      this.inherited(arguments);
      var widget = this;
      //console.log(this);
      // Set initial spinner values
      this.spinnerValues = [0, 0, 0];
      // create the drive time analysis service area task object
      this.serviceAreaTask = new ServiceAreaTask("https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea");
      // Create 3 spinners for user to choose drive times
      this.spinner1 = new NumberSpinner({
        value: this.spinnerValues[0],
        intermediateChanges: true,
        constraints: {
          min: 0,
          max: 15
        },
        id: "spinner1",
        style: "width:60px"
      }, spinnerDiv1);
      this.spinner2 = new NumberSpinner({
        value: this.spinnerValues[1],
        intermediateChanges: true,
        constraints: {
          min: 0,
          max: 15
        },
        id: "spinner2",
        style: "width:60px"
      }, spinnerDiv2);
      this.spinner3 = new NumberSpinner({
        value: this.spinnerValues[2],
        intermediateChanges: true,
        constraints: {
          min: 0,
          max: 15
        },
        id: "spinner3",
        style: "width:60px"
      }, spinnerDiv3);
      // When the user changes the value in a number spinner, update the corresponding spinnerValue
      on(this.spinner1, 'change', lang.hitch(widget, function (value) {
        this.set('value', value);
        widget.spinnerValues[0] = this.get('value');
        if (widget.spinnerValues[0] < 0) {
          widget.spinnerValues[0] = 0;
        } else if (widget.spinnerValues[0] > 15) {
          widget.spinnerValues[0] = 15;
        } else if (!widget.spinnerValues[0]) {
          widget.spinnerValues[0] = 0;
        };
        dom.byId('spinnerValueDiv').innerHTML = `Spinner 1: ${widget.spinnerValues[0]} <br> Spinner 2: ${widget.spinnerValues[1]} <br> Spinner 3: ${widget.spinnerValues[2]}`;
      }));
      on(this.spinner2, 'change', lang.hitch(widget, function (value) {
        this.set('value', value);
        widget.spinnerValues[1] = this.get('value');
        if (widget.spinnerValues[1] < 0) {
          widget.spinnerValues[1] = 0;
        } else if (widget.spinnerValues[1] > 15) {
          widget.spinnerValues[1] = 15;
        } else if (!widget.spinnerValues[1]) {
          widget.spinnerValues[1] = 0;
        };
        dom.byId('spinnerValueDiv').innerHTML = `Spinner 1: ${widget.spinnerValues[0]} <br> Spinner 2: ${widget.spinnerValues[1]} <br> Spinner 3: ${widget.spinnerValues[2]}`;
      }));
      on(this.spinner3, 'change', lang.hitch(widget, function (value) {
        this.set('value', value);
        widget.spinnerValues[2] = this.get('value');
        if (widget.spinnerValues[2] < 0) {
          widget.spinnerValues[2] = 0;
        } else if (widget.spinnerValues[2] > 15) {
          widget.spinnerValues[2] = 15;
        } else if (!widget.spinnerValues[2]) {
          widget.spinnerValues[2] = 0;
        };
        dom.byId('spinnerValueDiv').innerHTML = `Spinner 1: ${widget.spinnerValues[0]} <br> Spinner 2: ${widget.spinnerValues[1]} <br> Spinner 3: ${widget.spinnerValues[2]}`;
      }));
      // startup the spinners
      this.spinner1.startup();
      this.spinner2.startup();
      this.spinner3.startup();
      console.log('startup');
    },
    // every time the user opens the widget
    onOpen: function () {
      console.log('onOpen');
      // create an onClick event that runs the getDriveTimes, createGraphic, createServiceAreaParams and executeServiceAreaTask methods.
      // but only if the widget state is opened or active
      this.driveTimeEvent = on(this.map, 'click', lang.hitch(this, function (event) {
        //console.log(this.state);
        if (this.state === "opened" || this.state === "active") {
          //console.log(this.state);
          var widget = this;
          var driveTimeCutoffs = this.getDriveTimes(); // in Minutes
          var locationGraphic = this.createGraphic(event.mapPoint);
          var serviceAreaParams = this.createServiceAreaParams(locationGraphic, driveTimeCutoffs, event.mapPoint.spatialReference);
          //console.log(serviceAreaParams);
          this.executeServiceAreaTask(widget, driveTimeCutoffs, serviceAreaParams);
        };
      }));
    },
    // upon closing the widget, delete the driveTimeEvent onClick event
    onClose: function () {
      delete this.driveTimeEvent;
      console.log('onClose');
    },
    ////////////////// functions should look like this ///////////////////////////////
    createGraphic: function (point) {
      // Remove any existing graphics
      this.map.graphics.clear();
      // Create and add the point
      var marker = new SimpleMarkerSymbol();
      marker.setSize(10);
      marker.setColor(new Color([0, 77, 168, 0.25]));
      var graphic = new Graphic(point, marker);
      this.map.graphics.add(graphic);
      //console.log(point, this.map.graphics);
      return graphic;
    },
    // getDriveTimes returns the spinnerValues array minus all 0s and duplicates, sorted from least to greatest
    getDriveTimes: function () {
      driveTimeArr = [];
      for (var i = 0; i < this.spinnerValues.length; i++) {
        if (this.spinnerValues[i] > 0 && array.indexOf(driveTimeArr, this.spinnerValues[i]) === -1) {
          driveTimeArr.push(this.spinnerValues[i]);
        };
      };
      return driveTimeArr.sort(function (a, b) { return a - b });
    },
    // createServiceAreaParams generates the serviceAreaTask parameters to be used in the executeServiceAreaTask method
    createServiceAreaParams: function (locationGraphic, driveTimeCutoffs, outSpatialReference) {
      var featureSet = new FeatureSet();
      featureSet.features = [locationGraphic];
      var taskParameters = new ServiceAreaParameters();
      taskParameters.defaultBreaks = driveTimeCutoffs;
      taskParameters.outSpatialReference = outSpatialReference;
      taskParameters.facilities = featureSet;
      return taskParameters;
    },
    // executeServiceAreaTask finds where you can get within certain drive times and draws that area to the map
    executeServiceAreaTask: function (widget, driveTimeCutoffs, serviceAreaParams) {
      //console.log("testing", driveTimeCutoffs, serviceAreaParams);
      if (!driveTimeCutoffs[0]) {
        //console.log("no drive times")
        return false;
      } else {
        return this.serviceAreaTask.solve(serviceAreaParams, function (serviceAreaSolveResult) {
          this.serviceAreaSolveResult = serviceAreaSolveResult;
          var num = 0;
          var line = new SimpleLineSymbol();
          line.setStyle(SimpleLineSymbol.STYLE_SHORTDOT);
          widget.fill1 = new SimpleFillSymbol();
          widget.fill1.setColor(widget.config.settings.furthestDistanceColorPicker);
          widget.fill1.setOutline(line);
          widget.fill2 = new SimpleFillSymbol();
          widget.fill2.setColor(widget.config.settings.middleDistanceColorPicker);
          widget.fill2.setOutline(line);
          widget.fill3 = new SimpleFillSymbol();
          widget.fill3.setColor(widget.config.settings.leastDistanceColorPicker);
          widget.fill3.setOutline(line);
          // console.log("test", fill1);
          fillArr = [widget.fill1, widget.fill2, widget.fill3];

          dojo.forEach(serviceAreaSolveResult.serviceAreaPolygons, function (graphics) {
            graphics.symbol = fillArr[num];
            widget.map.graphics.add(graphics);
            //console.log("testing", fillArr[num]);
            num++;
          });
        });
      };
    }
    // onMinimize: function(){
    //   console.log('onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('onMaximize');
    // },

    // onSignIn: function(credential){
    //   /* jshint unused:false*/
    //   console.log('onSignIn');
    // },

    // onSignOut: function(){
    //   console.log('onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('onPositionChange');
    // },

    // resize: function(){
    //   console.log('resize');
    // }

    //methods to communication between widgets:
  });
});

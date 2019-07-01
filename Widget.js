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
  'dojo/on',
  'dojo/domReady!'
], function (declare, lang, array, BaseWidget, Map, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, ServiceAreaTask, ServiceAreaSolveResult, ServiceAreaParameters, FeatureSet, Graphic, NumberSpinner, dom, on) {
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
      console.log(this);
      console.log(this.state);
      var spinnerValues = [1, 3, 5];
      this.serviceAreaTask = new ServiceAreaTask("https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea");

      on(this.map, 'click', lang.hitch(this, function (event) {
        if (this.state === "opened") {
          console.log(this.state);
          var view = this;
          var driveTimeCutoffs = getDriveTimes(); // in Minutes
          var locationGraphic = createGraphic(view, event.mapPoint);
          var serviceAreaParams = this.createServiceAreaParams(locationGraphic, driveTimeCutoffs, event.mapPoint.spatialReference);
          console.log(serviceAreaParams);
          executeServiceAreaTask(view, serviceAreaParams);
        };
      }));


      //this.mapIdNode.innerHTML = 'map id:' + this.map.id;
      var spinner1 = new NumberSpinner({
        value: 1,
        intermediateChanges: true,
        constraints: {
          min: 0,
          max: 15
        },
        id: "spinner1",
        style: "width:60px"
      }, spinnerDiv1);
      var spinner2 = new NumberSpinner({
        value: 3,
        intermediateChanges: true,
        constraints: {
          min: 0,
          max: 15
        },
        id: "spinner2",
        style: "width:60px"
      }, spinnerDiv2);
      var spinner3 = new NumberSpinner({
        value: 5,
        intermediateChanges: true,
        constraints: {
          min: 0,
          max: 15
        },
        id: "spinner3",
        style: "width:60px"
      }, spinnerDiv3);

      on(spinner1, 'change', function (value) {
        this.set('value', value);
        spinnerValues[0] = this.get('value');
        if (spinnerValues[0] < 0) {
          spinnerValues[0] = 0;
        } else if (spinnerValues[0] > 15) {
          spinnerValues[0] = 15;
        } else if (!spinnerValues[0]) {
          spinnerValues[0] = 0;
        };
        dom.byId('spinnerValueDiv').innerHTML = `Spinner 1: ${spinnerValues[0]} <br> Spinner 2: ${spinnerValues[1]} <br> Spinner 3: ${spinnerValues[2]}`;
      });
      on(spinner2, 'change', function (value) {
        this.set('value', value);
        spinnerValues[1] = this.get('value');
        if (spinnerValues[1] < 0) {
          spinnerValues[1] = 0;
        } else if (spinnerValues[1] > 15) {
          spinnerValues[1] = 15;
        } else if (!spinnerValues[1]) {
          spinnerValues[1] = 0;
        };
        dom.byId('spinnerValueDiv').innerHTML = `Spinner 1: ${spinnerValues[0]} <br> Spinner 2: ${spinnerValues[1]} <br> Spinner 3: ${spinnerValues[2]}`;
      });
      on(spinner3, 'change', function (value) {
        this.set('value', value);
        spinnerValues[2] = this.get('value');
        if (spinnerValues[2] < 0) {
          spinnerValues[2] = 0;
        } else if (spinnerValues[2] > 15) {
          spinnerValues[2] = 15;
        } else if (!spinnerValues[2]) {
          spinnerValues[2] = 0;
        };
        dom.byId('spinnerValueDiv').innerHTML = `Spinner 1: ${spinnerValues[0]} <br> Spinner 2: ${spinnerValues[1]} <br> Spinner 3: ${spinnerValues[2]}`;
      });
      spinner1.startup();
      spinner2.startup();
      spinner3.startup();
      // Functions
      function createGraphic(view, point) {
        // Remove any existing graphics
        view.map.graphics.clear();
        // Create a and add the point
        var marker = new SimpleMarkerSymbol();
        marker.setSize(10);
        marker.setColor(new Color([0, 77, 168, 0.25]));
        var graphic = new Graphic(point, marker);//{
        // geometry: point,
        // symbol: marker
        //});
        view.map.graphics.add(graphic);
        console.log(point, view.map.graphics);
        return graphic;
      };
      
      function getDriveTimes() {
        driveTimeArr = [];
        for (var i = 0; i < spinnerValues.length; i++) {
          if (spinnerValues[i] > 0 && array.indexOf(driveTimeArr, spinnerValues[i]) === -1) {
            driveTimeArr.push(spinnerValues[i]);
          };
        };
        console.log("drive time array", driveTimeArr.sort(function (a, b) { return a - b }));
        return driveTimeArr.sort(function (a, b) { return a - b });
      };
      function executeSerciceAreaTask(view, serviceAreaParams) {
        console.log(serviceAreaParams);
        return serviceAreaTask.solve(serviceAreaParams, function (serviceAreaSolveResult) {
          var result = serviceAreaSolveResult;
          var num = 0;
          fill1 = new SimpleFillSymbol();
          fill2 = new SimpleFillSymbol();
          fill3 = new SimpleFillSymbol();
          var line = new SimpleLineSymbol();
          line.setStyle(SimpleLineSymbol.STYLE_SHORTDOT);
          var fill1 = new SimpleFillSymbol();
          fill1.setColor(new Color([0, 77, 168, 0.25]));
          fill1.setOutline(line);
          var fill2 = new SimpleFillSymbol();
          fill2.setColor(new Color([112, 168, 0, 0.25]));
          fill2.setOutline(line);
          var fill3 = new SimpleFillSymbol();
          fill3.setColor(new Color([168, 0, 0, 0.25]));
          fill3.setOutline(line);
          fillArr = [fill1, fill2, fill3];
          dojo.forEach(serviceAreaSolveResult.serviceAreaPolygons, function (graphics) {
            graphics.symbol = fillArr[num];
            view.map.graphics.add(graphics);
            console.log(fillArr[num]);
            num++;
          });
        });
      };
      console.log('startup');
      // onSpinnerChange = function (value) {
      //   this.set('value', value);
      //   var spinnerValue = this.get('value');
      //   if (spinnerValue < 0) {
      //     dom.byId('spinnerDiv1').innerHTML = `This is the value of the spinner: 0`;
      //   } else if (spinnerValue > 15) {
      //     dom.byId('spinnerDiv1').innerHTML = `This is the value of the spinner: 15`;
      //   } else if (spinnerValue) {
      //     dom.byId('spinnerDiv1').innerHTML = `This is the value of the spinner: ${spinnerValue}`;
      //   } else {
      //     dom.byId('spinnerDiv1').innerHTML = `This is the value of the spinner: 0`;
      //   };
      // }
    },
    ////////////////// functions should look like this ///////////////////////////////
    createServiceAreaParams: function(locationGraphic, driveTimeCutoffs, outSpatialReference) {
      var featureSet = new FeatureSet();
      featureSet.features = [locationGraphic];
      var taskParameters = new ServiceAreaParameters();
      taskParameters.defaultBreaks = driveTimeCutoffs;
      taskParameters.outSpatialReference = outSpatialReference;
      taskParameters.facilities = featureSet;

      return taskParameters;
    },

    // onOpen: function(){
    //   console.log('onOpen');
    // 
    // },

    // onClose: function(){
    //   console.log('onClose');
    // remove on click event
    // },

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
define(['dojo/_base/declare',
'dojo/_base/lang',
'jimu/BaseWidgetSetting',
'esri/dijit/ColorPicker',
"dojo/on"
], function(declare, lang, BaseWidgetSetting, ColorPicker, on) {
     return declare([BaseWidgetSetting], {
          startup: function(){
               this.inherited(arguments);
               var widget = this;
              this.leastDistanceColorPicker = new ColorPicker({
                collapsed: true,
                collapsible: true,
                color: widget.config.settings.leastDistanceColorPicker
              } , leastDistanceColorPicker);
              this.middleDistanceColorPicker = new ColorPicker({
                collapsed: true,
                collapsible: true,
                color: widget.config.settings.middleDistanceColorPicker
              } , middleDistanceColorPicker);
              this.furthestDistanceColorPicker = new ColorPicker({
                collapsed: true,
                collapsible: true,
                color: widget.config.settings.furthestDistanceColorPicker
              } , furthestDistanceColorPicker);
              console.log("test", this.leastDistanceColorPicker);            
              on(this.leastDistanceColorPicker, "color-change", function () {
                widget.config.settings.leastDistanceColorPicker = this.color;
                console.log(this, this.color, widget.config.settings.leastDistanceColorPicker);
              });
              on(this.middleDistanceColorPicker, "color-change", function () {
                widget.config.settings.middleDistanceColorPicker = this.color;
                console.log(this, this.color, widget.config.settings.middleDistanceColorPicker);
              });
              on(this.furthestDistanceColorPicker, "color-change", function () {
                widget.config.settings.furthestDistanceColorPicker = this.color;
                console.log(this, this.color, widget.config.settings.furthestDistanceColorPicker);
              });
              this.leastDistanceColorPicker.startup();
              this.middleDistanceColorPicker.startup();
              this.furthestDistanceColorPicker.startup();
              console.log(this, this.config);
              this.setConfig(this.config);
          },
          setConfig: function(config){
               this.config = config;
               
               console.log("settings read from file: ");
               console.log(config);
          },
          getConfig: function(){
               settings = this.config.settings;
               this.config.settings = settings;
               console.log("settings write to file: " + settings);
               console.log(this.config);
               return this.config;
          }
     });
});
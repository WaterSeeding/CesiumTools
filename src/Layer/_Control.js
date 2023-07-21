let _global_viewer = null;
function Control(viewer) {
  if (viewer) {
    this._viewer = viewer;
    _global_viewer = viewer;
  }
}

Control.prototype = {
  showLayerSwitchPanel: function (layers, gui, name) {
    if (layers && layers.length) {
      var layerObj = new (function () {
        layers.forEach((item) => {
          this[item.id] = item.show;
        });
      })();
      var layerSwitch = gui.addFolder(`${name} - 图层切换`);
      layers.forEach((item) => {
        layerSwitch
          .add(layerObj, item.id)
          .name(item.name)
          .onChange(function (value) {
            item.show = value;
          });
      });
      var layerAlphaObj = new (function () {
        layers.forEach((item) => {
          this[item.id] = item.alpha;
        });
      })();
      var layerAlpha = gui.addFolder(`${name} - 透明度`);

      layers.forEach((item) => {
        layerAlpha
          .add(layerAlphaObj, item.id, 0, 1, 0.05)
          .name(item.name)
          .onChange(function (value) {
            item.alpha = value;
          });
      });
      layerSwitch.open();
      layerAlpha.open();
    }
  },
};

export { Control };

import * as Cesium from "cesium";
import { nanoid } from "nanoid";

import Layer from "./Layer";
import {
  crsLinkHrefs,
  crsLinkTypes,
  crsNames,
  geoJsonObjectTypes,
} from "./LayerUtils";

import type Subscriber from "../Subscriber";
import type {
  BillboardPrimitiveItem,
  CirclePrimitiveItem,
  PrimitiveLayerOptions,
  LabelPrimitiveItem,
  PointPrimitiveItem,
  PolygonPrimitiveItem,
  PolylinePrimitiveItem,
  PrimitiveItem,
} from "./typings";
import DefaultOptions from "./_config/options";
import getPositionsCenter from "./_utils/getPositionsCenter";
import setCrsFunction from "./_utils/setCrsFunction";

export default class PrimitiveLayer extends Layer {
  private _name: string | undefined;
  private _isLoading: boolean;
  private _error: Cesium.Event;
  private _loading: Cesium.Event;
  private _primitiveCollection: Cesium.PrimitiveCollection;
  readonly _promises: Promise<any>[];
  private _credit: Cesium.Credit | undefined;
  private _featureItems: PrimitiveItem[] = [];
  private _pinBuilder: Cesium.PinBuilder;
  // Instances
  private _circleInstances: Cesium.GeometryInstance[] = [];
  private _polygonInstances: Cesium.GeometryInstance[] = [];
  private _polylineInstances: Cesium.GeometryInstance[] = [];
  // Collection
  private _billboardCollection: Cesium.BillboardCollection;
  private _labelCollection: Cesium.LabelCollection;
  private _pointCollection: Cesium.PointPrimitiveCollection;
  // Primitive
  private _circlePrimitive: Cesium.Primitive | undefined;
  private _polygonPrimitive: Cesium.Primitive | undefined;
  private _polylinePrimitive: Cesium.Primitive | undefined;
  private _isDestroyed = false;
  private _options: PrimitiveLayerOptions;
  private _geojson: GeoJSON.GeoJSON | undefined;

  constructor(
    options: {
      name?: string;
      subscriber?: Subscriber;
      options?: Partial<PrimitiveLayerOptions>;
    } = {}
  ) {
    super(options);

    this._error = new Cesium.Event();
    this._isLoading = false;
    this._loading = new Cesium.Event();
    this._pinBuilder = new Cesium.PinBuilder();
    this._primitiveCollection = new Cesium.PrimitiveCollection();
    this._billboardCollection = new Cesium.BillboardCollection();
    this._labelCollection = new Cesium.LabelCollection();
    this._pointCollection = new Cesium.PointPrimitiveCollection();
    this._options = { ...DefaultOptions, ...options.options };

    this._promises = [];
    this._credit = undefined;
  }

  get billboardCollection() {
    return this._billboardCollection;
  }

  get labelCollection() {
    return this._labelCollection;
  }

  get pointPrimitiveCollection() {
    return this._pointCollection;
  }

  get primitiveCollection() {
    return this._primitiveCollection;
  }

  get polygonPrimitive() {
    return this._polygonPrimitive;
  }

  get circlePrimitive() {
    return this._circlePrimitive;
  }

  get polylinePrimitive() {
    return this._polylinePrimitive;
  }

  get featureItems() {
    return this._featureItems;
  }

  get pinBuilder() {
    return this._pinBuilder;
  }

  /**
   * Gets or sets a human-readable name for this instance.
   * @type {String}
   */
  get name() {
    return this._name;
  }

  set name(value) {
    if (this._name !== value) {
      this._name = value;
      // @ts-ignore
      this._changed.raiseEvent(this);
    }
  }

  /**
   * Gets a value indicating if the data source is currently loading data.
   * @type {Boolean}
   */
  get loading() {
    return this._isLoading;
  }

  /**
   * Gets an event that will be raised when the underlying data changes.
   * @type {Cesium.Event}
   */
  get changedEvent() {
    return this._changed;
  }

  get credit() {
    return this._credit;
  }

  /**
   * Gets an event that will be raised if an error is encountered during processing.
   * @type {Cesium.Event}
   */
  get errorEvent() {
    return this._error;
  }
  /**
   * Gets an event that will be raised when the data source either starts or stops loading.
   * @type {Cesium.Event}
   */
  get loadingEvent() {
    return this._loading;
  }
  /**
   * Gets whether or not this data source should be displayed.
   * @type {Boolean}
   */
  get show() {
    return this._primitiveCollection.show;
  }
  set show(value) {
    this._primitiveCollection.show = value;
  }
  /**
   * Gets an object that maps the name of a crs to a callback function which takes a GeoJSON coordinate
   * and transforms it into a WGS84 Earth-fixed Cartesian.  Older versions of GeoJSON which
   * supported the EPSG type can be added to this list as well, by specifying the complete EPSG name,
   * for example 'EPSG:4326'.
   * @type {Object}
   */
  get crsNames() {
    return crsNames;
  }

  /**
   * Gets an object that maps the href property of a crs link to a callback function
   * which takes the crs properties object and returns a Promise that resolves
   * to a function that takes a GeoJSON coordinate and transforms it into a WGS84 Earth-fixed Cartesian.
   * Items in this object take precedence over those defined in <code>crsLinkHrefs</code>, assuming
   * the link has a type specified.
   * @type {Object}
   */
  get crsLinkHrefs() {
    return crsLinkHrefs;
  }

  /**
   * Gets an object that maps the type property of a crs link to a callback function
   * which takes the crs properties object and returns a Promise that resolves
   * to a function that takes a GeoJSON coordinate and transforms it into a WGS84 Earth-fixed Cartesian.
   * Items in <code>crsLinkHrefs</code> take precedence over this object.
   * @type {Object}
   */
  get crsLinkTypes() {
    return crsLinkTypes;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get geojson() {
    return this._geojson;
  }

  private _generateId() {
    return nanoid();
  }

  addBillboard(item: BillboardPrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();
    const instance = this._billboardCollection.add({
      id,
      position,
      ...style,
    });
    this.addFeatureItem({
      ...item,
      id,
      instance,
      center: { cartesian3: position },
    });
    return instance;
  }

  addLabel(item: LabelPrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();
    const instance = this._labelCollection.add({
      id,
      position,
      ...style,
    });
    return instance;
  }

  addPoint(item: PointPrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();
    const instance = this._pointCollection.add({
      id,
      position,
      ...style,
    });
    this.addFeatureItem({
      ...item,
      id,
      instance,
      center: { cartesian3: position },
    });
    return instance;
  }

  addCircle(item: CirclePrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();

    const geometry = new Cesium.CircleGeometry({
      center: position,
      extrudedHeight: style?.extrudedHeight,
      radius: style?.radius ?? 1000,
    });
    const instance = new Cesium.GeometryInstance({
      geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          style?.color ?? this._options.fill
        ),
      },
      id,
    });

    this._circleInstances.push(instance);

    this.addFeatureItem({
      ...item,
      id,
      instance: geometry,
      center: { cartesian3: item.position },
    });

    return instance;
  }

  addPolygon(item: PolygonPrimitiveItem) {
    const { positions, style } = item;
    const id = this._generateId();

    const geometry = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(positions),
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      extrudedHeight: style?.extrudedHeight,
    });
    const instance = new Cesium.GeometryInstance({
      geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          style?.material ?? this._options.fill
        ),
      },
      id,
    });

    this._polygonInstances.push(instance);

    this.addFeatureItem({
      ...item,
      id,
      instance: geometry,
      center: getPositionsCenter(item.positions, style?.extrudedHeight),
    });
    this.addPolyline(
      {
        type: "Polyline",
        positions,
        style: {
          width: style?.outlineWidth,
          material: style?.outlineColor,
        },
      },
      false
    );

    return instance;
  }

  addPolyline(item: PolylinePrimitiveItem, addFeature = true) {
    const { positions, style } = item;
    const id = this._generateId();

    const geometry = new Cesium.PolylineGeometry({
      positions,
      vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
      width: style?.width,
    });
    const instance = new Cesium.GeometryInstance({
      geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          style?.material ?? this._options.stroke
        ),
      },
      id,
    });

    this._polylineInstances.push(instance);

    if (addFeature)
      this.addFeatureItem({
        ...item,
        id,
        instance: geometry,
        center: {
          cartesian3: item.positions[Math.floor(item.positions.length / 2)],
        },
      });

    return instance;
  }

  addFeatureItem(item: PrimitiveItem) {
    this._featureItems.push(item);
    return item;
  }

  /**
   * 根据id获取FeatureItem
   * @param {string} id
   * @returns {PrimitiveItem | undefined} FeatureItem
   */
  getFeatureItemById(id: string): PrimitiveItem | undefined {
    return this._featureItems.find((item) => item.id === id);
  }

  /**
   * 根据id从primitive collection中移除featureItem
   * @param {string} id featureItem id
   */
  removeFeatureItemById(id: string) {
    const feature = this._featureItems.find((item) => item.id === id);
    if (feature && feature.instance) {
      switch (feature.type) {
        case "Point":
          this._pointCollection.remove(feature.instance);
          break;
        case "Billboard":
          this._billboardCollection.remove(feature.instance);
          break;
        case "Label":
          this._labelCollection.remove(feature.instance);
          break;
        default:
          break;
      }
    }
    this._featureItems = this._featureItems.filter((item) => item.id !== id);
    return false;
  }

  /**
   * 通过异步加载提供的GeoJSON或TopoJSON数据，替换任何现有数据
   *
   * @param {Cesium.Resource|String|Object} data 加载的数据
   * @param {Object} [options] 具有以下属性的对象:
   * @param {String} [options.sourceUri] 覆盖要用于解析相对链接的url
   * @returns {Promise.<PrimitiveLayer>} 根据加载GeoJSON，解析出来的Promise
   */
  async load(
    url: string | Cesium.Resource | GeoJSON.GeoJSON,
    options: Partial<PrimitiveLayerOptions> = {}
  ): Promise<PrimitiveLayer> {
    let data = url;
    if (!Cesium.defined(data)) {
      throw new Cesium.DeveloperError("data is required.");
    }

    this._isLoading = true;

    let credit = options.credit;
    if (typeof credit === "string") {
      credit = new Cesium.Credit(credit);
    }
    this._credit = credit;

    let promise: any = data;
    let sourceUri = options.sourceUri;
    if (typeof data === "string") {
      data = new Cesium.Resource({ url: data });
    }
    if (data instanceof Cesium.Resource) {
      promise = data.fetchJson();
      sourceUri = sourceUri ?? data.getUrlComponent();
    }

    try {
      const geoJson = await Promise.resolve(promise);
      this._geojson = geoJson;
      return await this.preload(geoJson, options, sourceUri, true);
    } catch (error: any) {
      this._isLoading = false;
      this._error.raiseEvent(error);
      throw error;
    }
  }

  async preload(
    geoJson: GeoJSON.GeoJSON,
    layerOptions: Partial<PrimitiveLayerOptions>,
    sourceUri: string | undefined,
    clear: boolean
  ) {
    const options = { ...this._options, ...layerOptions };

    let name: string | undefined;
    if (sourceUri) {
      name = Cesium.getFilenameFromUri(sourceUri);
    }

    if (name && this._name !== name) {
      this._name = name;
      // @ts-ignore
      this._changed.raiseEvent(this);
    }

    // 检查坐标参考系
    const crs = (geoJson as any).crs;
    let crsFunction = setCrsFunction(crs);

    const typeHandler = geoJsonObjectTypes[geoJson.type];
    if (!Cesium.defined(typeHandler)) {
      throw new Cesium.RuntimeError(
        `Unsupported GeoJSON object type: ${geoJson.type}`
      );
    }

    return Promise.resolve(crsFunction).then(async (crsFunc) => {
      if (clear) {
        this._primitiveCollection.removeAll();
      }

      // null是crs的有效值，但意味着整个加载过程变为无操作
      // 因为我们不能对坐标做任何假设。
      if (crsFunc !== null) {
        typeHandler(
          this,
          geoJson,
          geoJson,
          crsFunc,
          options as PrimitiveLayerOptions
        );
      }

      await Promise.all(this._promises);
      this._promises.length = 0;
      this._isLoading = false;
      this.reloadPrimitive();
      return this;
    });
  }

  reloadPrimitive() {
    const appearance = new Cesium.PerInstanceColorAppearance({
      translucent: false,
      renderState: {
        depthTest: {
          enabled: true,
        },
        depthMask: true,
        blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
      },
    });

    this._circlePrimitive = new Cesium.Primitive({
      geometryInstances: this._circleInstances,
      appearance,
      asynchronous: false,
    });
    this._polygonPrimitive = new Cesium.Primitive({
      geometryInstances: this._polygonInstances,
      appearance,
      asynchronous: false,
    });
    this._polylinePrimitive = new Cesium.Primitive({
      geometryInstances: this._polylineInstances,
      appearance: new Cesium.PolylineColorAppearance(),
      asynchronous: false,
    });
    this._primitiveCollection.add(this._circlePrimitive);
    this._primitiveCollection.add(this._polygonPrimitive);
    this._primitiveCollection.add(this._polylinePrimitive);
    this._primitiveCollection.add(this._billboardCollection);
    this._primitiveCollection.add(this._labelCollection);
    this._primitiveCollection.add(this._pointCollection);
  }

  removeAllPrimitive() {
    this.primitiveCollection.removeAll();
    this._billboardCollection = new Cesium.BillboardCollection();
    this._labelCollection = new Cesium.LabelCollection();
    this._pointCollection = new Cesium.PointPrimitiveCollection();
    this._featureItems = [];
    this._circleInstances = [];
    this._polygonInstances = [];
    this._polylineInstances = [];
  }

  destroy() {
    this.primitiveCollection.removeAll();
    this.removeSubscribers();
    this._featureItems = [];
    this._polygonInstances = [];
    this._polylineInstances = [];
    this._isDestroyed = true;
    return true;
  }
}

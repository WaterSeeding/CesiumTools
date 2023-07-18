import setDrawImageText from './_utils/setDrawImageText';

export const setPointActivatingImg = async (name: string, info: any) => {
  let url = require(`./_img/${name}_active.png`);
  let isQiye = name.includes('企业');
  if (info?.properties?.number) {
    let num = info.properties.number;
    url = await setDrawImageText(url, num + '', isQiye);
  }
  return url;
};

export const setPointNormalImg = async (name: string, info: any) => {
  let url = require(`./_img/${name}.png`);
  let isQiye = name.includes('企业');
  if (info?.properties?.number) {
    let num = info.properties.number;
    url = await setDrawImageText(url, num + '', isQiye);
  }
  return url;
};

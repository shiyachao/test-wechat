// index.js
Page({
  data:{
    result:"",
    showAdd:false,
    addValue:"",
  },
  fromData(){
    const that = this;
    wx.request({
      url: 'https://www.mxnzp.com/api/lottery/common/history?code=cjdlt&size=50&app_id=zbtnx2fpxidjknmg&app_secret=Le67JdO87qvaqxKe2E1xsHcUuCFrWndm',
      method: "GET",
      success(res){
        const data = res.data.data.map(item=>{
          let arr = item.openCode.split(',');
          const last = arr.pop();
          arr = arr.concat(last.split('+'))
          return arr;
        });
        wx.setStorageSync('data', data);
        that.analyse(data);
      },
      fail(){
        that.setData({showAdd: true});
      }
    })
  },
  analyse(data){
    let countPre = new Array(35).fill(0);
    countPre = countPre.map((item,index)=>{
      return {
        num: index + 1,
        count: 0,
        skip: 0,
        skipStop:false
      }
    })
    let countAft = new Array(12).fill(0);
    countAft = countAft.map((item,index)=>{
      return {
        num: index + 1,
        count: 0,
        skip: 0,
        skipStop: false
      }
    })
    const space = {};
    data.forEach(item=>{
      countPre.map(item=>{
        if(!item.skipStop){
          item.skip += 1;
        }
        return item;
      })
      countAft.map(item=>{
        if(!item.skipStop){
          item.skip += 1;
        }
        return item;
      })
      const halfPre = item.slice(0,5);
      const halfAft = item.slice(-2);
      const pre = halfPre.filter(num=>Number(num)>=1 && Number(num) <= 12);
      const middle = halfPre.filter(num=>Number(num)>=13 && Number(num) <= 24);
      const aft = halfPre.filter(num=>Number(num)>=25 && Number(num) <= 35);
      halfPre.forEach(num=>{
        countPre[num-1].count += 1;
        if(!countPre[num-1].skipStop){
          countPre[num-1].skip -= 1;
        }
        countPre[num-1].skipStop = true;
      })
      halfAft.forEach(num=>{
        countAft[num-1].count += 1;
        if(!countAft[num-1].skipStop){
          countAft[num-1].skip -= 1;
        }
        countAft[num-1].skipStop = true;
      })
      const key = [pre.length,middle.length,aft.length].join(',');
      if(space[key]){
        space[key] = space[key] + 1
      }else{
        space[key] = 1;
      }
    })
    const spaceKeys = Object.keys(space);
    spaceKeys.sort((a,b)=>{
      return space[b] - space[a];
    })
    const [preTotal, middleTotal, aftTotal] = spaceKeys[1].split(",");
    const preArr = countPre.slice(0,13);
    preArr.sort(this.sortByCountAndSkip);
    const middleArr = countPre.slice(13,24);
    middleArr.sort(this.sortByCountAndSkip);
    const aftArr = countPre.slice(25);
    aftArr.sort(this.sortByCountAndSkip);
    countAft.sort(this.sortByCountAndSkip);

    const result = [];
    for(let i = 0; i< preTotal; i++){
      result.push(preArr[i]);
    }
    for(let i = 0; i< middleTotal; i++){
      result.push(middleArr[i]);
    }
    for(let i = 0; i< aftTotal; i++){
      result.push(aftArr[i]);
    }
    const resultArr = result.map(item=>item.num);
    resultArr.sort((a,b)=> a - b);
    const halfAftResult = countAft.slice(0,2).map(item=>item.num);
    halfAftResult.sort((a,b)=> a - b);
    const resultStr = resultArr.concat(halfAftResult).map(item=>{
      if(item < 10){
        return '0' + item;
      }else{
        return String(item);
      }
    }).join(',');
    this.setData({result: resultStr});
  },
  sortByCountAndSkip(a,b){
    // if(a.count === b.count){
    //   return b.skip - a.skip;
    // }else{
    //   return a.count - b.count
    // }
    const ar = a.skip - a.count;
    const br = b.skip - b.count;
    if(ar > 0 && br > 0){
      if(ar === br){
        if(b.skip === a.skip){
          return a.count - b.count;
        }else{
          return b.skip - a.skip;
        }
      }else{
        return br - ar;
      }
    }else if(ar < 0 && br < 0){
      if(ar === br){
        if(b.skip === a.skip){
          return a.count - b.count;
        }else{
          return b.skip - a.skip;
        }
      }else{
        return Math.abs(ar) - Math.abs(br);
      }
    }else if(ar < 0){
      return 1;
    }else if(br < 0){
      return -1;
    }
    return Math.abs(br) - Math.abs(ar);
  },
  addDataInput(e){
    this.setData({addValue: e.detail.value});
  },
  addData(){
    const data = wx.getStorageSync('data') || [];
    if(this.data.addValue){
      const newData = this.data.addValue.split(",");
      data.unshift(newData);
    }
    this.setData({showAdd: false});
    this.analyse(data);
  },
  random(){
    const preArr = [];
      const aftArr = [];
      for (let i = 0; i < 5; i++) {
        const preNum = this.setNum(1, 35, preArr);
        preArr.push(preNum);
      }
      for (let i = 0; i < 2; i++) {
        aftArr.push(this.setNum(1, 12, aftArr));
      }
      preArr.sort((a, b) => a - b);
      aftArr.sort((a, b) => a - b);
      let result = preArr.concat(aftArr).map((item) => {
        if (item < 10) {
          return "0" + item;
        } else {
          return "" + item;
        }
      });
      this.setData({result:result.join(",")});
  },
  setNum(min, max, preArr) {
    let num = this.getNum(min, max);
    if (preArr.includes(num)) {
      num = this.setNum(min, max, preArr);
    }
    return num;
  },
  getNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + 1;
  }
})

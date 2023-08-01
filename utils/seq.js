class Seq {
  constructor() {
    this.seq = 0; // 0 ～65535
  }

  get() {
    const nowSeq = this.seq % 65536;
    this.seq += 1;
    return nowSeq;
  }
}

module.exports = new Seq();

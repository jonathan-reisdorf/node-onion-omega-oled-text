// http://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript

module.exports = a => a[0].map((col, c) => a.map((row, r) => a[r][c]).reverse());
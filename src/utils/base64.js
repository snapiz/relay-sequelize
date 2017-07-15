export function base64(i) {
  return new Buffer(i, 'utf8').toString('base64');
}

export function unbase64(i) {
  return new Buffer(i, 'base64').toString('utf8');
}
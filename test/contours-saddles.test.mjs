import {test} from 'node:test';
import assert from 'node:assert/strict';
import {contourSegments} from '../src/contours.ts';
function grid([sw,se,ne,nw]){
 return [[{lat:0,lon:0,value:sw},{lat:0,lon:1,value:se}],[{lat:1,lon:0,value:nw},{lat:1,lon:1,value:ne}]];
}
function connections(values){
 const edge=([lat,lon])=>lat===0?'B':lon===1?'R':lat===1?'T':'L';
 return contourSegments(grid(values),0).map(pair=>pair.map(edge).sort().join('')).sort();
}
test('dominant saddle diagonals connect the correct side of both sign patterns',()=>{
 assert.deepEqual(connections([3,-1,3,-1]),['BR','LT']);
 assert.deepEqual(connections([-1,3,-1,3]),['BL','RT']);
});
test('bilinear saddle topology follows the determinant even when the centre average has the opposite sign',()=>{
 assert.deepEqual(connections([10,-4,1,-4]),['BL','RT']);
 assert.deepEqual(connections([-10,4,-1,4]),['BL','RT']);
});
test('exact saddle ties are deterministic and invariant under sign reversal',()=>{
 const positive=connections([1,-1,1,-1]),negative=connections([-1,1,-1,1]);
 assert.deepEqual(positive,negative);assert.deepEqual(positive,['BR','LT']);
 const segments=contourSegments(grid([1,-1,1,-1]),0);
 assert.equal(segments.length,2);assert.ok(segments.flat(2).every(Number.isFinite));
});

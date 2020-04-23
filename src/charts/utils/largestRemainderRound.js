export function largestRemainderRound(numbers, desiredTotal) {
    var result = numbers.map(function(number, index) {
      return {
        floor: Math.floor(number),
        remainder: getRemainder(number),
        index: index,
      };
    }).sort(function(a, b) {
      return b.remainder - a.remainder;
    });
  
    var lowerSum = result.reduce(function(sum, current) {
      return sum + current.floor;
    }, 0);
  
    var delta = desiredTotal - lowerSum;
    for (var i = 0; i < delta; i++) {
      result[i].floor++;
    }
  
    return result.sort(function(a, b) {
      return a.index - b.index;
    }).map(function(result) {
      return result.floor;
    });
  }
  
  function getRemainder(number) {
    var remainder = number - Math.floor(number);
    return remainder.toFixed(4);
  }
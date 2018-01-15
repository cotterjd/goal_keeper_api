function turnObjectIntoGraphQLinput(obj) {
  if (!obj) return "";

  function parseValue(key, obj) {
    var type = typeof obj[key];
    if (Array.isArray(obj[key])) {
      var string = `${key}: [`;
      for (var x = 0; x < obj[key].length; x++) {
        var element = obj[key][x];
        if (typeof element == "string") {
          string += `"${element}"`;
        } else if (typeof element == "number") {
          string += `${element}`;
        } else {
          string += `{${parseObj(element)}}`;
        }
        string += `${x == obj[key].length - 1 ? "" : ","}`;
      }
      return string + "] ";
    } else if (obj[key] === null) {
      return `${key}: "" `;
    } else if (type == "number" || type == "boolean") {
      return `${key}: ${obj[key]} `;
    } else if (obj[key] instanceof Date) {
      return `${key}: "${obj[key].toISOString()}" `;
    } else if (type == "object") {
      return `${key}: {${parseObj(obj[key])}} `;
    } else {
      return `${key}: "${obj[key]}" `;
    }
  }

  function parseObj(obj) {
    var keys = Object.keys(obj);
    if (!keys.length) return "";
    var string = "";
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      string += parseValue(key, obj);
    }
    return string;
  }
  var ret = parseObj(obj);
  return ret ? `(${ret})` : "";
}

//{mutaton:true, queries:[{input:{blah:blah}, output:"blah", action: "blahQuery"}]
function query(graphs) {
  if (!(graphs && graphs.queries && graphs.queries.length)) {
    throw new Error(
      "query must be given an object with key queries that is an array"
    );
  }
  var string = `${graphs.mutation ? "mutation" : ""}{`;
  for (var i = 0; i < graphs.queries.length; i++) {
    var q = graphs.queries[i];
    string += `${
      graphs.mutation && graphs.queries.length > 1 ? "p" + i + ": " : ""
    }${q.action}${turnObjectIntoGraphQLinput(q.input)}${q.output} `;
    if (i != graphs.queries.length - 1) {
      string += ", ";
    }
  }
  var ret = string + "}";
  return ret;
}
function mutation(graphs) {
  graphs.mutation = true;
  return query(graphs);
}
module.exports = {
  turnObjectIntoGraphQLinput: turnObjectIntoGraphQLinput,
  query: query,
  mutation: mutation
};

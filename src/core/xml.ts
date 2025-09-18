export class xml {
  static header = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";

  static envelope(body: string): string {
    // aliases to make it shorter...
    const xmlns = "xmlns";
    const w3 = "http://www.w3.org/2001/XMLSchema";
    const schemas = "http://schemas.xmlsoap.org/soap/";

    return `<v:Envelope ${xmlns}:i="${w3}-instance" ${xmlns}:d="${w3}" ${xmlns}:c="${schemas}encoding/" ${xmlns}:v="${schemas}envelope/"><v:Header/><v:Body>${body}</v:Body></v:Envelope>`;
  }

  static from_entities(encoded: string): string {
    return encoded
      .replace(/\&lt;/g, "<")
      .replace(/\&gt;/g, ">")
      // https://stackoverflow.com/a/27020300
      .replace(/&#\d+;/gm, function (s) {
        // @ts-expect-error : we know it's a number
        return String.fromCharCode(s.match(/\d+/gm)[0]);
      });
  }

  static property(name: string, value: string, type = "string"): string {
    return `<${name} i:type="d:${type}">${this.to_entities(value)}</${name}>`;
  }

  static to_entities(decoded: string): string {
    return decoded
      // https://stackoverflow.com/a/27020300
      .replace(/./gm, (s) => {
        return (s.match(/[.<>a-z0-9\s]+/i))
          ? s
          : "&#" + s.charCodeAt(0) + ";";
      })
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

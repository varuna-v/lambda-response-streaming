import { Stream } from "stream";

export class ResponseStream extends Stream.Writable {
  private response: Buffer[];
  _contentType?: string;
  _isBase64Encoded?: boolean;

  constructor() {
    super();
    this.response = [];
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.response.push(Buffer.from(chunk, encoding));
    callback();
  }

  getBufferedData(): Buffer {
    return Buffer.concat(this.response);
  }

  setContentType(contentType: string) {
    this._contentType = contentType;
  }

  setIsBase64Encoded(isBase64Encoded: boolean) {
    this._isBase64Encoded = isBase64Encoded;
  }
}

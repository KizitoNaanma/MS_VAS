import { Injectable } from '@nestjs/common';

@Injectable()
export class StringUtilsService {
  /**
   * @method isEmpty
   * @param {String | Number | Object} value
   * @returns {Boolean} true & false
   * @description this value is Empty Check
   */
  public isEmpty(value: string | number | object): boolean {
    if (value === null) {
      return true;
    } else if (typeof value !== 'number' && value === '') {
      return true;
    } else if (typeof value === 'undefined' || value === undefined) {
      return true;
    } else {
      return (
        value !== null &&
        typeof value === 'object' &&
        !Object.keys(value).length
      );
    }
  }

  /**
   * @method isNotEmpty
   * @param {String | Number | Object} value
   * @returns {Boolean} true & false
   * @description this value is not Empty Check
   */
  public isNotEmpty(value: string | number | object): boolean {
    return !this.isEmpty(value);
  }

  toTitleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  randomNumbers(length: number) {
    const power10minus1 = 10 ** (length - 1);
    const power10 = 10 ** length;
    let rand = Math.floor(
      power10minus1 + Math.random() * (power10 - power10minus1 - 1),
    );
    if (String(rand).slice(0, 1) === '0') {
      rand = Math.floor(Math.random() * 899999 + 100000);
    }
    return rand;
  }

  generateRef(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  timestamp() {
    return Date.now().toString();
  }
  generateTxReference() {
    return `${this.generateRef(10).toUpperCase()}`;
  }
}

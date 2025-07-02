import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as xml2js from 'xml2js';
import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';
import { XMLRoot } from '../../types/nfse/xml';

export class XMLProcessor {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      format: true,
      suppressEmptyNode: true
    });
  }

  parseXML(xmlString: string): XMLRoot {
    try {
      return this.parser.parse(xmlString);
    } catch (error) {
      throw new Error(`Erro ao fazer parse do XML: ${error}`);
    }
  }

  buildXML(obj: XMLRoot): string {
    try {
      return this.builder.build(obj);
    } catch (error) {
      throw new Error(`Erro ao gerar XML: ${error}`);
    }
  }

  validateXMLStructure(xmlString: string): boolean {
    try {
      const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      const errors = doc.getElementsByTagName('parsererror');
      return errors.length === 0;
    } catch {
      return false;
    }
  }

  extractElementValue(xmlString: string, xpathExpression: string): string | null {
    try {
      const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      const result = xpath.select(xpathExpression, doc);
      
      if (Array.isArray(result) && result.length > 0) {
        return result[0].textContent || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async parseWithXml2js(xmlString: string): Promise<XMLRoot> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlString, {
        explicitArray: false,
        mergeAttrs: true,
        trim: true
      }, (err, result) => {
        if (err) {
          reject(new Error(`Erro xml2js: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });
  }
}
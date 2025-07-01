export interface XMLElement {
  [key: string]: string | number | XMLElement | XMLElement[] | undefined;
}

export interface XMLRoot {
  [key: string]: XMLElement;
}

export interface ParsedXML {
  NFSe?: XMLElement;
  DPS?: XMLElement;
}
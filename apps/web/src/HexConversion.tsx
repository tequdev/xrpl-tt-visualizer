import React, { useEffect, useState } from "react";
import JsonTextArea from "./components/JsonTextArea";
import HookTextArea from "./components/HookTextArea";
import { buildHookTx, definitionsFromJson, XrplDefinitionsBase } from "xahau-hook-tx-builder";

const HexConversion: React.FC = () => {
  const [hexOutput, setHexOutput] = useState<string>("");
  const [defs, setDefs] = useState<XrplDefinitionsBase | undefined>(undefined);
  useEffect(() => {
    const strip = (html: string) => {
      let doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    let url = 'https://xahau.network/server_definitions.json'
    
    const searchUrl = window.location.search.substr(1)
    if (!(searchUrl === undefined || (''+searchUrl).trim() === ''))
      url = strip(searchUrl)

    fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function (jsonResponse) {
      setDefs(definitionsFromJson(jsonResponse))
    }).catch(e=>{
        console.log(e);
        throw new Error("Could not load: " + strip(url));
    });
    
   },[])
  
  const handleOnConvert = (json: any, hasCallback: boolean) => {
    setHexOutput(buildHookTx(JSON.parse(json), { definitions: defs, hasCallback }))
  };

  return (
    <div>
      <h1>Xahau Hook Tx Builder</h1>
      <p>Paste a json Xahau tx below to convert it to a c hook binary tx.</p>
      <p>To use custom definitions, specify the path to the JSON file as follows:<br/>
      https://tx-builder.xahau.tools/?https://example.com/definitions.json</p>
      <JsonTextArea onConvert={handleOnConvert} />
      <HookTextArea value={hexOutput} />
    </div>
  );
};

export default HexConversion;

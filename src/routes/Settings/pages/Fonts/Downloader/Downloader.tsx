import React, { useEffect, useState } from "react"
import { Virtuoso } from 'react-virtuoso'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from './../FontsTheme.module.scss'

import SaveIcon from '@resources/iconmonstr/iconmonstr-save-14.svg'
import TashIcon from '@resources/feathericons/trash-2.svg'
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import webfonts from '../../../../../../public/resources/webfonts.json'
const myStyle = webfonts.items.map((item) => { return {name:item.family, link:item.files.regular, files: item.files}})

// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"
const defaultMarks = [100,200,300,400,500,600,700,800].reduce((a, v)=>{
  
  return {...a, ...{
    [v]:{label: <div style={{fontWeight:v}}>{v}</div>}
  }}
  
},{})

const Downloader = ()=>{
  const [textFiltered, setTextFilter] = useState("")
  const [currentDataList, setCurrentDataList] = useState(myStyle)
  const [selectedFont, setSelectedFont] = useState("FontName")
  const [selectedWeight, setSelectedWeight] = useState(500)
  const [availableMarks, setAvailableMarks] = useState(defaultMarks)
  return (
    <>
      <div className={styles.fontRow}>
        <div></div>
        <div style={{fontFamily:selectedFont, fontWeight: selectedWeight}}>{selectedFont}</div> <SaveIcon onClick={async ()=>{
          const response = await fetch(`https://fonts.googleapis.com/css2?family=${selectedFont}:wght@${selectedWeight}&display=swap`);
          const data = await response.text();
          
          /* This Code is for handing when the request is made in a browser. It seems a ttf instead of a woff2 list is returned when using curl without headers 
          const fontList = data.split("/*").filter(s=>s.includes("latin"))
          console.log(fontList)
          let fontFace = ''
          fontFace = fontList.filter(s=>s.includes("latin-ext"))[0]
          if(fontFace == undefined){
            fontFace = fontList.filter(s=>s.includes("latin"))[0]
          }
          console.log(fontFace)

          const matches = fontFace.match(/src: url\((.+woff2)\)\s/);
          
          console.log(matches[1]);
          */
          const matches = data.match(/src: url\((.+ttf)\)\s/);
          if (matches == null){
            console.log("No Matches Found")
            return
          }
          const fontUrl = matches[1]

          
          invoke("download_font", {url:fontUrl, name: selectedFont, weight: "" + selectedWeight})

        }}/>
      </div>
      <div className={styles.sliderContainer}>
      
        <link href={`https://fonts.googleapis.com/css2?family=${selectedFont}:wght@${Object.keys(availableMarks).reduce((a, v)=>{return (a==""? a + v: a + ";" + v)},"")}&display=swap`} rel="stylesheet"></link>
        
        <div style={{height:25, "visibility":Object.keys(availableMarks).length == 1?"hidden":"visible"}}>
          <Slider
            marks={availableMarks}
            min={Math.min(...Object.keys(availableMarks).map((item)=> parseInt(item)))}
            className={styles.slider}
            step={null}
            onChange={(e)=>{
              if(typeof e === "number"){
                // dispatch(SetProgress({view: 0, progress: e/1000}))
                setSelectedWeight(e)
              }

            }}
            value={selectedWeight}
            max={Math.max(...Object.keys(availableMarks).map((item)=> parseInt(item)))}/>
        </div>

      </div>

      {/* </div> */}
      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Theme Name</div>
        <input onChange={(e)=>{
          console.log(e.target.value,e.target.value.length)
          setTextFilter(e.target.value)
          setCurrentDataList(myStyle.filter((item)=>item.name.toLowerCase().includes(e.target.value.toLowerCase())))
        }} value={textFiltered} style={{display:"block"}} className={styles.comboTextBox}/>
      </div>


      <div className={styles.listContainer}>

        <Virtuoso style={{ height: '100%' }} totalCount={currentDataList.length} itemContent={index => {
          return (<div>
            <div onClick={()=> {
              setSelectedFont(currentDataList[index].name)
              console.log(Object.keys(currentDataList[index].files))
              const mapped = Object.keys(currentDataList[index].files).reduce((a, v)=>{
                if(v == "regular"){
                  return {...a, ...{
                    [v=="regular"?400:v]:{label: <div style={{fontWeight:v}}>{v}</div>}
                  }}
                }else{
                  return a
                }
                
              },{})
              console.log(mapped)
              setAvailableMarks(mapped)
              setSelectedWeight(400)
            }}
            style={
              {textAlign:"center",
                fontWeight:(selectedFont == currentDataList[index].name? "bold":""), 
                backgroundColor:(selectedFont == currentDataList[index].name? "#E5F3FB":""), 
                border:(selectedFont == currentDataList[index].name? "1px solid #70C0E7":""), 
                fontFamily:currentDataList[index].name}
              
            }>{currentDataList[index].name}
              <link href={`https://fonts.googleapis.com/css2?family=${currentDataList[index].name.replace(" ","+")}&display=swap`} rel="stylesheet"></link>
            </div>
            
          </div>)}} />

        
      </div>
    </>
  )
}


export default Downloader
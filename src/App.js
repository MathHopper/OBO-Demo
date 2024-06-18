import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; 
import Map, {Line, Layer} from 'react-map-gl';
import vessel1 from "./vessel1.geojson";
import vessel2 from "./vessel2.geojson";

mapboxgl.accessToken = 'pk.eyJ1Ijoib2FrdHJlZWFuYWx5dGljcyIsImEiOiJjbGhvdWFzOHQxemYwM2ZzNmQxOW1xZXdtIn0.JPcZgPfkVUutq8t8Z_BaHg';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const [lng, setLng] = useState(120.5);
  const [lat, setLat] = useState(23.5);
  const [zoom, setZoom] = useState(6);
  
  const [markLon, setMarkLon] = useState(0);
  const [markLat, setMarkLat] = useState(0);  

  const [question, setQuestion] = useState();
  const [result, setResult] = useState();
  const [displayHistory, setDisplayHistory] = useState(0);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value)
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData()
    if (question) {
      formData.append('question', question)
    }
    fetch('http://127.0.0.1:5000/nestor', {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        setResult(data.result);
         setMarkLon(data.lon);
         setMarkLat(data.lat);
         setDisplayHistory(data.displayHistory);
      })
      .catch((error) => {
      console.error("Error", error)
    })
  }
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [121, 23.7],
      zoom: zoom
    })
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
    
  });
  function mapping(){
    var mappings =[];
    for (var i = 0; i < markLat.length; i++){
      mappings.push(
        new mapboxgl.Marker()
        .setLngLat([markLon[i], markLat[i]])
        .addTo(map.current)
      );
    }
  }

  const [coordinates, setCoordinates] = useState();
  const formData2 = new FormData()

  function vesselHistory(){
    const geojsonSource = {
      type: 'geojson',
      data: vessel1,
    };
    map.current.addSource('route', geojsonSource);
    map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#FF0000',
            'line-width': 2
        }
    });
  }    
  function vesselHistory2(){
    const geojsonSource = {
      type: 'geojson',
      data: vessel1,
    };
    const geojsonSource2 = {
      type: 'geojson',
      data: vessel2,
    };
    map.current.addSource('route2', geojsonSource2, geojsonSource);
    map.current.addLayer({
        'id': 'route2',
        'type': 'line',
        'source': 'route2',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#0000FF',
            'line-width': 2
        }
    });
  }
  function generate(){
      vesselHistory();
      vesselHistory2();
  }  
  useEffect(() => {
      mapping();
  });
  useEffect(() => {
    if(displayHistory == 1){
      generate();
    }  else{

    }
  },[displayHistory])

  return (
    <div>
      <div ref= {mapContainer} class="map"></div>
      <div className = "interface">
        <div className="nestor-logo">
          <h1 className="header">Nestor</h1>
        </div>
        <h1 id="test"></h1>
        <button onClick={()=>setDisplayHistory(1)}>Display</button>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder='What do you want to know?' className='question-box' value={question} onChange={handleQuestionChange}/>
          <button type="submit" disabled={!question}>Run</button>
        </form>
        <p className="answer-container">{result} {displayHistory}</p>
      </div>
    </div>
  )
}


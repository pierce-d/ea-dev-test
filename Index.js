import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

// holds API data
const dataStructure = []

// holds all the record label names
var labelNames = [];

// core function of the system, in charge of beginning the order hierarchy
function initiateHierarchy() {
  for (var item of dataStructure) { // get festival of API
    for (var band of item.bands) { // get band object
      if (!labelNames.includes(band.recordLabel)) { // check to see if record label is a ditto
        if (band.recordLabel == null || band.recordLabel == "") { // check to see if record label data is missing
          if (!labelNames.includes("Bands with no record label")) { // pass a default string for missing label
            labelNames.push("Bands with no record label"); // add default label to array
          }
        } else {
          labelNames.push(band.recordLabel); // add label to array
        }
      }
    }
  }
}

// the RecordLabel custom component initiates the rendering of the hierarchy
function RecordLabels() {
  const listItems = labelNames.map(ln => ( // iterate of label names
    <li id={ln}>
      {ln} <!--write label name to the DOM-->
      <ul> <!--add sub category for the bands-->
        <Bands recordLabel={ln} /> <!--call Bands component with label name as a prop -->
      </ul>
    </li>
  ));

  return <ul>{listItems}</ul>; // return the new list we receive from the Bands component
}

// the festival component, responsible for getting festival data
function Festivals(props) {
  var festivals = []; // an array to hold each band's festivals
  for (var item of dataStructure) { // get festival
    for (var band of item.bands) { //  get band
      if (props.bandName == band.name) { // get the correct band
        festivals.push(<li>{item.name}</li>); // add festival to array
      }
    }
  }
  return festivals; // return the festivals to be rendered
}

// the Bands component, responsible for getting band data
function Bands(props) {
  var bandResults = []; // array for bands and their festivals
  for (var item of dataStructure) { // get festival
    for (var band of item.bands) { // get band
      if (band.recordLabel == props.recordLabel) {
        bandResults.push( // add band data to the array
          <li>
            {band.name} <!--write band name-->
            <ul> <!--call festivals component to get festival data for each band-->
              <Festivals bandName={band.name} recordLabel={props.recordLabel} />
            </ul>
          </li>
        );
      } // call festivals component to get festival data for each band if they have no label
      if ( 
        props.recordLabel == "Bands with no record label" &&
        (band.recordLabel == "" || band.recordLabel == null)
      ) {
        listResults.push(
          <li>
            {band.name}
            <ul>
              <Festivals bandName={band.name} recordLabel={props.recordLabel} />
            </ul>
          </li>
        );
      }
    }
  }

  // list bands in alphabetical order
  bandResults.sort(function(a, b) {
    if (a.props.children < b.props.children) {
      return -1;
    }
    if (a.props.children > b.props.children) {
      return 1;
    }
    return 0;
  });

  // return bands and festivals to be rendered
  return <section>{bandResults}</section>;
}

// main body of the application, calls API
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null, // manage error state from API
      isLoaded: false, // manage state of API progress
      items: [] // store received API data
    };
  }
  
  componentDidMount() {
    /* 
    request data from http://eacodingtest.digital.energyaustralia.com.au/api-docs/#/festivals/APIFestivalsGet
    
    expected data structure: 
    
    [
      {
        "name": "string",
        "bands": [
          {
            "name": "string",
            "recordLabel": "string"
          }
        ]
      }
    ]  
    
    */ 
    
    /* 
    call to API fails with CORS error denying access
    API needs to be set to enable Wildcards for CORS, 
    however for this test proxy can be used in package.json
    to bypass CORS checking
    */ 
    fetch("http://eacodingtest.digital.energyaustralia.com.au/api/v1/festivals")
      .then(result => result) // get data from API
      .then(result => result.json()) // get API data as JSON
        result => { // handle API success
          console.log(result); // check the data
          this.setState({
            isLoaded: true, // set state to loaded
            items: result // add data to state
          });
        },
        
        error => { // handle API error
          this.setState({
            isLoaded: true, // set state to loaded
            error // thow an error
          });
        }
      );
  }

  render() {
    // save state values to avoid calling this.state later
    const { error, isLoaded, items } = this.state;
    if (error) { // display error message
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) { // display loading message
      return <div>Loading...</div>;
    } else {
    dataStructure = items
    initiateHierarchy();
    return (
      <div>
        <!--render hierarchy-->
        <RecordLabels />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

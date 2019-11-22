import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import Axios from 'axios';
import { 
  Button,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Form, 
  FormGroup
   } from 'reactstrap'


class MapContainer extends Component {
    state = { 
        initPosition: {
            latitude: null,
            longitude: null
        },
        purwadhika: {
            latitude: -6.302403,
            longitude: 106.6500593
        },
        markers: [
            [-6.3026379,106.6387701],
            [-6.2958715,106.6328683],
            [-6.2931805,106.6121837]
        ],
        search: null,
        locations: [],
        selectedName: null,
        activeMarker: {},
        showingInfoWindow: false,
        selectedPlace: {},
        venueId: null,
        venueDetail: []
    }

     componentDidMount(){
        // this.fourSquare()
        if(localStorage.getItem('latitude') && localStorage.getItem('longitude')){
            var latitude = localStorage.getItem('latitude')
            var longitude = localStorage.getItem('longitude')
            console.log(latitude, longitude)
            var initPosition = {...this.state.initPosition}
            initPosition.latitude = latitude;
            initPosition.longitude = longitude;
            this.setState({ initPosition })
            this.fourSquare()
        }else{
            this.getEcoLocation()
        }
    }

    fourSquare = () => {
      var latitude = localStorage.getItem('latitude')
      var longitude = localStorage.getItem('longitude')
      var headers = {
        client_id: 'SBZXLFEQJZ3JVQ3XSPLWM022NCSD5H4T0WOLDDGYT2HMHD1W',
        client_secret: 'OUCSMZRVDCNNBY4NP5NOP52IVS5WHRWWGGJS2MOHSA3RMNME',
        query: 'restaurants',
        // near: 'Serpong',
        v: "20191029",
        ll: latitude +','+ longitude,
        radius: 1000,
        limit: 10
      }

      Axios.get('https://api.foursquare.com/v2/venues/explore?' + new URLSearchParams(headers))
      .then((res) => {
          // console.log(res.data.response.groups[0].items)
          this.setState({ locations: res.data.response.groups[0].items })
          console.log(this.state.locations)
          console.log(res.data)
      })
      .catch((err) => {
          console.log(err)
      })
    }

    getEcoLocation = () => {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(this.showPosition, this.showError, 
          {
            maximumAge:10000, 
            timeout:5000, 
            enableHighAccuracy: true 
          })
          console.log(navigator.geolocation)
      }else{
          console.log('Geolocation is not supported by this browser.')
      }
    }

    renderModal = () => {
      if(this.state.openModal === true && this.state.venueDetail !== []){
        return this.state.venueDetail.map((val, index) => {
          return(
            <div key={index}>
              <Modal isOpen={this.state.openModal} toggle={this.toggle} className={this.props.className}>
              <ModalHeader toggle={this.toggle}>{val.name}</ModalHeader>
                <ModalBody>
                  <Form>
                    <FormGroup>
                      <h5>{val.location.address}</h5>
                      {/* <img src={val.prefix + val.suffix} alt='foto' /> */}
                      <h5>Rating: {val.rating}/10</h5>
                      <h5>Category: {val.categories[0].name}</h5>
                    </FormGroup>
                  </Form>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onClick={this.addNewProduct}>Book Venue</Button>{' '}
                  <Button color="secondary" onClick={() => this.setState({openModal: false, venueDetail: [] })}>Cancel</Button>
                </ModalFooter>
              </Modal>
            </div>
          )
        })
        }
      }
                
    showPosition = (position) => {
        console.log(position)
        console.log("Latitude: " + position.coords.latitude+', longitude:'+ position.coords.longitude)
        var initPosition = {...this.state.initPosition}
        initPosition.latitude = position.coords.latitude;
        initPosition.longitude = position.coords.longitude;
        localStorage.setItem('latitude', initPosition.latitude)
        localStorage.setItem('longitude', initPosition.longitude)
        this.setState({initPosition})
    }

    showError = (err) => {
        console.log(err)
    }
    getVenueData = (venueId) => {
      var headers = {
        client_id: 'SBZXLFEQJZ3JVQ3XSPLWM022NCSD5H4T0WOLDDGYT2HMHD1W',
        client_secret: 'OUCSMZRVDCNNBY4NP5NOP52IVS5WHRWWGGJS2MOHSA3RMNME',
        v: "20191029"
      }
      Axios.get(`https://api.foursquare.com/v2/venues/${venueId}?` + new URLSearchParams(headers))
      .then((res) => {
        console.log(res.data.response.venue)
        this.setState({ venueDetail: [res.data.response.venue], openModal: true })
      })
    }

    onInfoWindowOpen(props, e) {
      const button = (<input type='button' className='btn btn-danger' onClick={() => this.getVenueData(this.state.venueId)} value='Select Venue'/>);
      ReactDOM.render(React.Children.only(button), document.getElementById("contoh"));
    }

    renderMarker = () => {
      const mapStyles = {
        width: '100%',
        height: '90%',
    }; 
      return(
        <Map
          google={this.props.google}
          zoom={15}
          initialCenter={{ lat: this.state.initPosition.latitude, lng: this.state.initPosition.longitude }}
          style={mapStyles}
          onClick={() => this.setState({
            activeMarker: null,
            showingInfoWindow: null,
            selectedName: null,
            selectedPlace: null,
            venueId: null
          })}
        >
          <Marker 
            position={{ lat: this.state.initPosition.latitude, lng: this.state.initPosition.longitude }}
            onClick={this.onMarkerClick}
            title={'My Position'} 
            id={'contoh'} 
          />
          {this.state.locations.map((val, index) => {
            return(
              <Marker 
                key={index}
                position={{lat: val.venue.location.lat, lng: val.venue.location.lng}}
                onClick={this.onMarkerClick}
                title={val.venue.name}
                id={val.venue.id}
              />
            )
          })}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
            onOpen={e => {
              this.onInfoWindowOpen(this.props, e);
            }}
            >
             <div>
              <h1>{this.state.selectedName}</h1>
              {
                this.state.selectedName === 'My Position'
                ?
                null
                :
                <div id="contoh" className='d-flex justify-content-center mt-1'>
                </div>
              }

            </div>
          </InfoWindow>

        </Map>
      )
    }

    

    onMarkerClick = (props, marker, e) =>{
      this.setState({
        selectedName: props.title,
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true,
        selectedAddress: props,
        venueId: props.id 
      });
    }

    render() {
        if(this.state.initPosition.latitude === null && this.state.initPosition.longitude === null){
            return <></>
        }

        return(
          <div>
            {this.renderMarker()}
            {this.renderModal()}
          </div>
        )
    }
}
 
export default GoogleApiWrapper({
  apiKey: 'AIzaSyCjiEvKBLC3BmjAheYSltL1t5tW6OLYt7w'
})(MapContainer);
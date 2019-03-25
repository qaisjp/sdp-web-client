import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Card from "../../components/Card/Card";
import Modal from "../../components/Modal/Modal";
import endpoints from "../../endpoints";
import httpFetchPhotos from "../../http/fetch_photos";

const Gallery = props => {
  const [photos, setPhotos] = useState([]);
  const [viewPhotoModalOpen, viewPhotoModalVisible] = useState(false);
  const [photo, setPhoto] = useState(null);

  const createViewPhotoModalContent = () => {
    return (
      <React.Fragment>
        {photo && (
          <img style={{ width: "100%" }} src={photo.img} alt={photo.title} />
        )}
      </React.Fragment>
    );
  };

  const createViewPhotoModalFooter = () => {
    return <React.Fragment />;
  };

  const onClickPhoto = photo => {
    setPhoto(photo);
    viewPhotoModalVisible(true);
  };

  const fetchPhotos = async () => {
    const { loginToken } = props;
    const fetchPhotosResult = await httpFetchPhotos(loginToken);

    if (!(fetchPhotosResult instanceof Error)) {
      const { photos } = fetchPhotosResult;

      setPhotos(
        photos.map(photo => {
          const photoUrl =
            endpoints.photos + "/" + photo.id + "?token=" + loginToken;

          return {
            title: photo.id,
            img: photoUrl
          };
        })
      );
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="content">
      <Modal
        open={viewPhotoModalOpen}
        close={() => viewPhotoModalVisible(false)}
        title={"View Image"}
        content={createViewPhotoModalContent()}
        footer={createViewPhotoModalFooter()}
      />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <Card
              title={"Photo gallery"}
              content={
                <div className="container-fluid">
                  <center>
                    <div className="row">
                      {photos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => onClickPhoto(photo)}
                          className="col-md-6"
                        >
                          <img
                            style={{
                              height: "50%",
                              width: "80%",
                              marginBottom: "25px"
                            }}
                            src={photo.img}
                            alt={photo.title}
                          />
                        </div>
                      ))}
                    </div>
                  </center>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  const { auth } = state;
  return {
    loginToken: auth.loginToken
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Gallery);

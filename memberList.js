import { ListGroup, Row, Col, CloseButton } from 'react-bootstrap';
import { updateGroupMemberEvents } from '../../lib/fetchEvents';
import { React, useState } from 'react';

export default function MemberList(props) {
  /*List of group members and options to hide individual's events or remove members from the group*/
  const members = props.members;
  const [clicked, setClicked] = useState(false);

  return (
    <ListGroup>
      {members.map((member) => (
        <ListGroup.Item
          className="overflow-auto d-flex align-items-center"
          style={{ width: '400px', height: '41px' }}
        >
          <Row className="d-flex">
            <Col className="me-3" style={{ width: '275px' }}>
              {/*Group member's name */}
              {member[1]}{' '}
            </Col>
            <Col
              className="d-flex justify-content-center"
              style={{ witdh: '100px' }}
            >
              {/*Button to hide/show a specific group member's events. If the group member's events are 
                already hidden, the button will read 'Show Events.' Otherwise it will read 'Hide Events.' */}
              {props.hideId?.indexOf(member[0]) > -1 ? (
                <p
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '150px',
                    marginRight: '-5%',
                  }}
                  onClick={() => {
                    let newHideId = props.hideId.filter(
                      (Id) => Id !== member[0]
                    );
                    props.setHideId(newHideId);
                    sessionStorage.setItem('hideId', JSON.stringify(newHideId));
                    setTimeout(() => {
                      window.location.reload(false);
                    }, 1000);
                  }}
                >
                  Show Events
                </p>
              ) : (
                <p
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '150px',
                    marginRight: '-5%',
                  }}
                  onClick={() => {
                    let newHideId = [...props.hideId, member[0]];
                    props.setHideId(newHideId);
                    sessionStorage.setItem('hideId', JSON.stringify(newHideId));
                    setTimeout(() => {
                      window.location.reload(false);
                    }, 1000);
                  }}
                >
                  Hide Events
                </p>
              )}
              {/*Button to update a group member's events by re-pulling their events from Google Calendar. */}
              <p
                style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  right: '50px',
                }}
                onClick={() => {
                  if (clicked) return;
                  setClicked(true);
                  updateGroupMemberEvents(props.groupId, member[0]);
                  setTimeout(() => {
                    window.location.reload(false);
                  }, 1000);
                }}
              >
                Refresh
              </p>
              {/*Button to remove a user from the group. Will display a pop-up modal for confirmation. */}
              {props.admin && props.edit && (
                <CloseButton
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '10px',
                  }}
                  onClick={() => {
                    props.handleShow();
                    props.setDelUser({
                      name: member[1],
                      email: member[2],
                      id: member[0],
                    });
                  }}
                ></CloseButton>
              )}
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

import DefaultLayout from '../layouts/DefaultLayout';
import { Button, Container, Row, Col, ButtonGroup } from 'react-bootstrap';
import AddGroupMembersForm from '../components/forms/AddGroupMembersForm';
import DeleteGroupButton from '../components/Buttons/DeleteGroupButton';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../Constants';
import EventCalendar from '../components/calender/EventCalendar';
import { checkGroup, fetchGroupEvents } from '../lib/fetchEvents';
import { checkUser } from '../lib/fetchUser';
import MemberList from '../components/Group/memberList';
import DeleteModal from '../components/Group/DeleteModal';
import FreeTimeForm from '../components/forms/FreeTimeForm';
import LeaveGroupModal from '../components/Group/LeaveGroupModal.js';
import LeaveGroupButton from '../components/Buttons/LeaveGroupButton.js';

const CLASSNAME = 'd-flex justify-content-center align-items-center';

export default function GroupDetails({ user }) {
  /*The page that displays all users of a particular group and their respective calendar events.
    Users can add and remove members from the group, hide certain group members' events, and schedule new 
    events on Google calendar from this page. */
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [members, setMembers] = useState([]);
  const [edit, setEdit] = useState(false);
  const [show, setShow] = useState(false);
  const [events, setEvents] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [del_user, setDelUser] = useState('');
  const [admin, setAdmin] = useState('');
  const [hideId, setHideId] = useState([]);
  const [showLeave, setShowLeave] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowGroup = () => setShowGroup(true);
  const handleCloseLeave = () => setShowLeave(false);
  const handleShowLeave = () => setShowLeave(true);
  const path = window.location.pathname;
  let groupId = path.substring(path.lastIndexOf('/'));
  let url = config.url + '/api/group' + groupId;
  let deleteUrl = config.url + '/api/group/members' + groupId;
  let eventsUrl = config.url + '/api/group/events' + groupId;

  useEffect(() => {
    async function fetchData() {
      /*Check if the user is currently logged in and the current group exists. 
        If not, redirect the user to either the home page or the group page*/
      const user = await checkUser();
      if (!user.authenticated) navigate('/');
      const groupInfo = await checkGroup(url, user);

      if (!groupInfo?.exists) navigate('/groups');
      setName(groupInfo.group.name);
      setMembers(groupInfo.group.groupMembers);
      setAdmin({
        id: groupInfo.group.admin,
        isAdmin: groupInfo.group.admin === user.user.id,
      });
    }
    fetchData();

    async function getEvents() {
      /*Retrieve events of all users in the current group that aren't hidden. 
        Hidden user ids are stored in session storage. */
      let newHideId = JSON.parse(sessionStorage.getItem('hideId'));
      {
        newHideId ? setHideId(newHideId) : setHideId([]);
      }
      const groupEvents = await fetchGroupEvents(eventsUrl, newHideId);
      setEvents(groupEvents);
      setFetched(true);
    }
    fetchData();
    if (!fetched) getEvents();
  }, [events]);

  return (
    <DefaultLayout className={CLASSNAME}>
      <Row style={{ marginTop: '-1%', marginBottom: '1%' }}>
        <Col className="d-flex justify-content-center align-items-center">
          <h1>{name}</h1>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          {/*Display the group calendar and all non-hidden group members' events */}
          <EventCalendar events={events} groups={true} />
        </Col>

        <Col>
          <div className="d-flex justify-content-center align-items-center mx-auto">
            <ButtonGroup style={{ marginBottom: '5%', marginRight: '0.5%' }}>
              {/*The button that toggles the visibility of group editing options (add/remove members, etc)*/}
              {admin.isAdmin && (
                <Button
                  onClick={() => {
                    setEdit((prevEdit) => !prevEdit);
                  }}
                >
                  Edit Group
                </Button>
              )}
            </ButtonGroup>
            <ButtonGroup style={{ marginBottom: '5%', marginRight: '0.5%' }}>
              {/*The button that finds free timeslots between group members' events 
                and writes events to their google calendars */}
              <FreeTimeForm
                hideId={hideId}
                eventsUrl={eventsUrl}
                userId={user}
              />
            </ButtonGroup>
          </div>
          <Container fluid>
            <Row className="mb-3 d-flex justify-content-center align-items-center">
              <Col
                xs={4}
                className="d-flex justify-content-center align-items-center mx-auto"
              >
                {/*List of group members and options to hide individual's events or remove members from the group*/}
                <MemberList
                  members={members}
                  groupId={groupId}
                  admin={admin.isAdmin}
                  edit={edit}
                  hideId={hideId}
                  setHideId={setHideId}
                  handleShow={handleShow}
                  setDelUser={setDelUser}
                ></MemberList>
              </Col>
            </Row>
            <Row>
              <Col></Col>
              <Col className="d-flex justify-content-center align-items-center mx-auto">
                {/*Input Box to add new members to a group */}
                {admin.isAdmin && edit && (
                  <AddGroupMembersForm
                    user={user}
                    groupName={name}
                    groupId={groupId.substring(1)}
                  ></AddGroupMembersForm>
                )}
              </Col>
              <Col></Col>
            </Row>
            <Row>
              <Col
                style={{ paddingTop: '5%' }}
                className="d-flex justify-content-center align-items-center mx-auto"
              >
                {/*Button to delete an entire group from the database. Only available to the group's admin. */}
                {admin.isAdmin && edit && (
                  <DeleteGroupButton
                    handleShowGroup={handleShowGroup}
                    setDelGroup={setDelGroup}
                    groupName={name}
                  ></DeleteGroupButton>
                )}

                {/*Button to leave a group. Only available to non-admin group members. */}
                {!admin.isAdmin && (
                  <LeaveGroupButton
                    user={user}
                    setDelUser={setDelUser}
                    handleShowLeave={handleShowLeave}
                  ></LeaveGroupButton>
                )}
              </Col>
            </Row>
          </Container>
          {/*Pop-up modal when an admin wants to delete a group. */}
          <DeleteModal
            show={show}
            email={del_user.email}
            propUser={user}
            admin={admin}
            id={del_user.id}
            handleClose={handleClose}
            name={del_user.name}
            deleteUrl={deleteUrl}
          ></DeleteModal>
          {/*Pop-up modal when a group member wants to leave a group. */}
          <LeaveGroupModal
            show={showLeave}
            email={del_user.email}
            id={del_user.id}
            handleClose={handleCloseLeave}
            groupName={name}
            deleteUrl={deleteUrl}
          ></LeaveGroupModal>
        </Col>
      </Row>
    </DefaultLayout>
  );
}

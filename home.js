import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  AppBar,
  TextField,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TagIcon from '@mui/icons-material/Tag';
import { ContextMenu } from '../styles/styles';
import GroupBar from '../components/Group/GroupBar';
import Board from '../components/Board/Board';
import { useSelector } from 'react-redux';
import { createGroup, handleFetchAllGroups } from '../lib/group';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { leaveGroup } from '../lib/group';
import { RetrieveMembers } from '../components/Group/avatars';

const drawerWidth = 240;

export default function PermanentDrawerLeft() {
  const user = useSelector((state) => state.user);
  const [open, setOpen] = React.useState(true);
  const [clicked, setClicked] = React.useState(false);
  const [points, setPoints] = React.useState({ x: 0, y: 0 });
  const [groupDetails, setGroupDetails] = React.useState({
    name: '',
    number: 0,
  });

  const handleClick = () => {
    setOpen(!open);
  };

  const [groupField, setGroupField] = React.useState(false);
  const [groupName, setGroupName] = React.useState('');
  const [successAlertOpen, setSuccessAlertOpen] = React.useState(false);
  const [errorAlertOpen, setErrorAlertOpen] = React.useState(false);
  const [groups, setGroups] = React.useState([{ name: 'Loading...' }]);
  const [showAlert, setShowAlert] = React.useState(false);
  const [leaving, setLeaving] = React.useState({ groupId: '', googleId: '' });
  const [members, setMembers] = React.useState([]);

  const handleCreateGroup = async (groupName, userId) => {
    try {
      await createGroup(groupName, userId);
      setSuccessAlertOpen(true);
    } catch (error) {
      setErrorAlertOpen(true);
    }
  };

  useEffect(() => {
    handleFetchAllGroups(user.info.id, setGroups);
    const handleClick = () => setClicked(false);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {/*Banners displaying success or failure when trying to create a new group */}
      <Snackbar
        open={successAlertOpen}
        autoHideDuration={6000}
        onClose={() => setSuccessAlertOpen(false)}
      >
        <Alert onClose={() => setSuccessAlertOpen(false)} severity="success">
          Group created successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorAlertOpen}
        autoHideDuration={6000}
        onClose={() => setErrorAlertOpen(false)}
      >
        <Alert onClose={() => setErrorAlertOpen(false)} severity="error">
          Failed to create group. Please try again.
        </Alert>
      </Snackbar>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
          }}
        >
          <GroupBar
            groupName={groupDetails.name}
            groupNum={groupDetails.number}
            members={members}
          ></GroupBar>
        </AppBar>

        {/*Pop-up menu when a user right-clicks a group. */}
        {clicked && (
          <ContextMenu top={points.y} left={points.x}>
            <List>
              <ListItemButton
                onClick={() => {
                  leaveGroup(leaving.groupId, leaving.googleId);
                  window.location.reload(false);
                }}
              >
                Leave Group
              </ListItemButton>
            </List>
          </ContextMenu>
        )}

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />

          {/*List of groups the user is in. Clicking on a group changes the content of the screen.
          Right-clicking a group brings up the context menu. */}
          <List>
            <ListItemButton onClick={handleClick}>
              <ListItemIcon>
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
              <ListItemText primary="Groups" />
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {groups?.map((group, index) => (
                  <ListItem key={group.name} index={index} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        RetrieveMembers({
                          groupId: group.group,
                          user: user,
                          setMembers: setMembers,
                        });
                        setGroupDetails({
                          name: group.name,
                          number: group.size,
                        });
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setClicked(true);
                        setPoints({
                          x: e.pageX,
                          y: e.pageY,
                        });
                        setLeaving({
                          groupId: group.group,
                          googleId: user.info.id,
                        });
                      }}
                    >
                      <ListItemIcon>
                        <TagIcon />
                      </ListItemIcon>
                      <ListItemText primary={group.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
          <Divider />

          {/*Button to create a new group. Clicking the button brings up an input box and submit button 
          for the new group name. */}
          <List>
            <ListItemButton
              onClick={() => {
                setGroupField(!groupField);
              }}
            >
              <ListItemIcon>
                {groupField ? <CloseIcon /> : <AddIcon />}
              </ListItemIcon>
              <ListItemText primary={groupField ? 'Close' : 'Create a Group'} />
            </ListItemButton>
            {groupField && (
              <ListItem>
                <Box p={1}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (groupName === '') return;
                      handleCreateGroup(groupName, user.info.id);
                      setGroupName('');
                      window.location.reload(false);
                    }}
                  >
                    <TextField
                      label="New group name"
                      value={groupName}
                      onChange={(event) => {
                        setGroupName(event.target.value);
                      }}
                      variant="outlined"
                      fullWidth
                    />
                  </form>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<AddIcon />}
                    sx={{ marginTop: 1 }}
                    onClick={() => {
                      if (groupName === '' || !groupName) {
                        setShowAlert(true);
                        setTimeout(() => {
                          setShowAlert(false);
                        }, 3000);
                        return;
                      }
                      handleCreateGroup(groupName, user.info.id);
                      setGroupName('');
                      window.location.reload(false);
                    }}
                  >
                    Create
                  </Button>
                  <Snackbar
                    open={showAlert}
                    autoHideDuration={6000}
                    onClose={() => setShowAlert(false)}
                  >
                    <Alert onClose={() => setShowAlert(false)} severity="error">
                      Please input a group name
                    </Alert>
                  </Snackbar>
                </Box>
              </ListItem>
            )}
          </List>
        </Drawer>
        <Box>
          <Toolbar />
          <Board />
        </Box>
      </Box>
    </>
  );
}

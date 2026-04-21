import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Index from './pages/index'
import Installation from './pages/installation/installation';
import Login from './pages/login/login';
import Search_index from './pages/search/search_index';

import Event_management_dashboard from './pages/management_dashboard/management_dashboard';
import Team_management from './pages/management_team/management_team';
import Event_data_management from './pages/management_event_data_view/management_event_data_view';
import Master_record_management from './pages/management_master_record/management_master_record';
import Event_data_upload from './pages/management_data_upload/management_data_upload';
import Set_password from './pages/invite_password_setting/set_password';

const router = createBrowserRouter([
  {
    path:'/',
    element: <Index/>,
  },
  {
    path:'/install',
    element: <Installation/>,
  }
  ,
  {
    path:'/auth',
    element: <Login/>,
  }
  ,
  {
    path:'/search',
    element: <Search_index/>,
  },
  {
    path:'/event',
    element: <Event_management_dashboard/>,
  },
  {
    path:'/team',
    element: <Team_management/>,
  },
  {
    path:'/event_data',
    element: <Event_data_management/>,
  },
  {
    path:'/record_data',
    element: <Master_record_management/>,
  },
  {
    path:'/event_data_upload',
    element: <Event_data_upload/>,
  },
  {
    path:'/invite/:id',
    element: <Set_password/>,
  }

])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

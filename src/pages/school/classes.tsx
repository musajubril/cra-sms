import React from "react";
import SchoolLayout from "components/SchoolLayout";
import Cards from "School/Classes";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getRequest, postRequest } from "api/apiCall";
import { HOMEROOMS } from "api/apiUrl";
import { queryKeys } from "api/queryKey";
import { ToastContext } from "App.jsx";
import jwtDecode from "jwt-decode";
import { useParams } from "react-router-dom";

export const getServerSideProps = (context: { query: { school: any } }) => {
  const { school } = context.query;

  return { props: { school } };
};

export default function SchoolClasses() {
  const easysch_token: { school_uid: any } = jwtDecode(
    localStorage?.easysch_token
  );
  const { schoolSlug: school } = localStorage

  const { data: homerooms } = useQuery(
    [queryKeys.getClasses, easysch_token?.school_uid],
    async () => await getRequest({ url: HOMEROOMS(easysch_token?.school_uid) }),
    {
      retry: 2,
      enabled: !!easysch_token?.school_uid,
    }
  );
  const [state, setState] = React.useState({
    name: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };
  const cache = useQueryClient();
  const { showAlert } = React.useContext(ToastContext);
  const { mutate } = useMutation(postRequest, {
    onSuccess(data) {
      showAlert({
        message: data?.message,
        severity: "success",
      });
      setRooms([...rooms, { name: data?.data.name, id: data?.data.id }]);
      setOpen(false);
      setState({
        name: "",
      });

      cache.invalidateQueries();
    },
  });
  const submitForm = (e: any) => {
    e.preventDefault();
    mutate({
      url: HOMEROOMS(easysch_token?.school_uid),
      data: {
        name: state.name,
      },
    });
  };
  const [rooms, setRooms] = React.useState(homerooms?.data);
  const roomval = homerooms?.data;
  React.useEffect(() => {
    setRooms(roomval);
  }, [roomval]);
  const [open, setOpen] = React.useState(false);
  return (
    <SchoolLayout currentPage="Classes">
      <Cards
        rooms={rooms}
        handleChange={handleChange}
        handleSubmit={submitForm}
        open={open}
        setOpen={setOpen}
        school={school}
      />
    </SchoolLayout>
  );
}

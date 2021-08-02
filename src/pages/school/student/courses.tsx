import React from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getRequest, postRequest } from 'api/apiCall';
import { HOMEROOMCOURSES, STUDENT, STUDENTCOURSES } from 'api/apiUrl';
import { queryKeys } from 'api/queryKey';
import ProfilePage from 'ProfilePage';
import Courses from 'School/Student/Courses';
import SchoolLayout from 'components/SchoolLayout';
import { ToastContext } from 'App.jsx';
import { useParams } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

export const getServerSideProps = (context: { query: { student: any, school: any } }) => {
  const { student, school } = context.query;

  return { props: { student, school } };
};

export default function StudentCourses() {
  const token = jwt_decode(localStorage?.token)
  const { id: student, slug: school } = useParams()
  const [classId, setClassId] = React.useState()
  const { data: homeroomCourseList } = useQuery(
    [queryKeys.getHomeroomCourses, classId, token?.school_uid],
    async () => await getRequest({ url: HOMEROOMCOURSES(token?.school_uid, classId) }),
    {
      retry: 2,
      enabled: !!(token?.school_uid&&classId)
    }
  );
  const { data: studentCourseList } = useQuery(
    [queryKeys.getStudentCourses, classId, token?.school_uid],
    async () => await getRequest({ url: STUDENTCOURSES(token?.school_uid, student) }),
    {
      retry: 2,
      enabled: !!(token?.school_uid&&classId)
    }
  );
  const {
    data:studentList
  } = useQuery(
    [queryKeys.getStudent, token?.school_uid],
    async () => await getRequest({ url: STUDENT(token?.school_uid, student) }),
    {
      retry: 2,
      enabled: !!token?.school_uid
    }
    )
  const [list, setStudent] = React.useState(studentList?.data)
  const [studentCourses, setStudentCourses] = React.useState(studentCourseList?.data)
  const [homeroomCourses, setHomeroomCourses] = React.useState(homeroomCourseList?.data)
    React.useEffect(() => {

    setStudent(studentList?.data)
    setHomeroomCourses(homeroomCourseList?.data)
    setStudentCourses(studentCourseList?.data)
    setClassId(studentList?.data.current_class.id)
  }, [studentList?.data, homeroomCourseList?.data, studentCourseList?.data])
  const [state, setState] = React.useState<any>({
    subject_ids: []
  })
  const cache = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const {showAlert}  = React.useContext(ToastContext)
  const { mutate } = useMutation(postRequest, {
   onSuccess(data) {
      showAlert({
        message: data?.message,
        severity: "success",
      });
      setOpen(false)
      cache.invalidateQueries()
      setSelected([])
    },
  });
  const submitForm = (e: any) => {
    e.preventDefault();
    mutate({
      url: STUDENTCOURSES(token?.school_uid, student),
      data: {
        subject_class_ids: state.subject_ids
      },
    });
  };
  const [selected, setSelected] = React.useState([]);
  return (
    <>
      <SchoolLayout Component={<ProfilePage Component={<Courses
        state={state}
        roomCourses={homeroomCourses}
        studentCourses={studentCourses}
        setState={setState}
        handleSubmit={submitForm}
        open={open}
                setOpen={setOpen}
                selected={selected} setSelected={setSelected}
      />} user="student" userId={student} page="Courses" school={school}  />} currentPage='Students' slug={school} />
      </>
  )
}

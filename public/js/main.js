const server = 'http://localhost:4500';

let table = document.querySelector('table');
let courseList = [];
const personCourses = [];
const session  = [];
function fetchAllData(){
    fetchCourses();
    fetchAdminUsers();
}

async function fetchCourses(){
    try{
        const url = server + '/coursesInfo';
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }
        const response = await fetch(url, options);
        const courses = await response.json();
        populateUserForm(courses);
        fetchUserCourses(courses);
        populateCoursesTable(courses);
        // console.log(courses);
        // writeToDOM(courses);
    }catch(error){
        console.log("Error over here " + error);
    }
}

function writeToDOM(data){
    document.getElementById('courses').innerHTML = data;
}


async function fetchAdminUsers(){
    try{
        const url = server + '/adminUsers';
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }
        const response = await fetch(url, options);
        const users = await response.json();
        personCourses.push(users);
        populateUsersTable(users);
        console.log(users);
    }catch(error){
        console.log("Error over here " + error);
    }
}

async function fetchUserCourses(courses){
    try{
        const url = server + '/sessionInfo';
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }
        fetchAdminUsers();
        const response = await fetch(url, options);
        const sessionInfo = await response.json();
        session.push(sessionInfo);
        console.log(personCourses);
        for(let person of personCourses){
            if(person.netid === 'ab0004'){
                console.log("part 1");
                document.getElementById('courseID').innerHTML = person.courseID;
                for(let courses of courseList){
                    if(person.courseID === courses.courseID){
                        console.log("part 2");
                        document.getElementById('courseName').innerHTML = courses.courseName;
                        document.getElementById('courseDescription').innerHTML = courses.courseDesc;
                        if(person.lecturer == true)
                            document.getElementById('Role').innerHTML = 'lecturer';
                        else if(person.student == true)
                            document.getElementById('Role').innerHTML = 'student';
                        else
                            document.getElementById('Role').innerHTML = 'other';
                    }
                }
            }
        }
    }catch(error){
        console.log(error);
    }
}

function populateUserForm(data){
    var student = document.getElementById('studentCourses');
    var lecturer = document.getElementById('lecturerCourses');
    var studentCourses =  ``;
    var lecturerCourses = ``;

     for(let i = 0; i < data.length; i++){
        studentCourses += `<input type="checkbox" value="${data[i].courseID}" name="studentCourses"/> ${data[i].courseID} <br> `;
        lecturerCourses += `<input type="checkbox" value="${data[i].courseID}" name="lecturerCourses"/> ${data[i].courseID} <br>`;
    }

    student.innerHTML = studentCourses;
    lecturer.innerHTML = lecturerCourses;
}
function populateCoursesTable(data){
    var createdTable = document.getElementById('courseTable');
    let table = `<table class = "table">
    <thead>
        <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Course Description</th>
        </tr>
    </thead>
    <tbody>`;

    for (let i = 0; i < data.length; i++) {
        table += "<tr><td>" + data[i].courseID + "</td>";
        table += "<td>" + data[i].courseName + "</td>";
        table += "<td>" + data[i].courseDesc + "</td>";
    }
    table += "</tbody></table>";

    createdTable.innerHTML = table;
}

function populateUsersTable(data){
    var createdTable = document.getElementById('usersTable');
    console.log(data);
    let table = `<table class = "table">
    <thead>
        <tr>
            <th>UserName</th>
            <th>User Email</th>
            <th>Course Learning</th>
            <th>Courses Teaching</th>
        </tr>
    </thead>
    <tbody>`;

    console.log("alexander");

    for (let i = 0; i < data.length; i++) {
        table += "<tr><td>" + data[i].firstName + "</td>";
        table += "<td>" + data[i].lastName + "</td>";
        table += "<td>" + data[i].lecturerCourses + "</td>";
        table += "<td>" + data[i].studentCourses + "</td>";
    }
    table += "</tbody></table>";

    createdTable.innerHTML = table;
}


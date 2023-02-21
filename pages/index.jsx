import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { userService } from 'services';

export default Index;

function Index() {
    const [users, setUsers] = useState(null);
    const [searchfield, setSearchfield] = useState('');
    const [datatodisplay, setDatatodisplay] = useState([]);
    const [datatodisplayKendra, setDatatodisplayKendra] = useState([]);
    const [datatodisplayKendraFlag, setDatatodisplayKendraFlag] = useState(false);
    const [datatodisplayFlag, setDatatodisplayFlag] = useState(false);
    const [noDataFound, setNoDataFound] = useState('');
    const [noDataFoundFlag, setNoDataFoundFlag] = useState(false);
      // form validation rules 
      const validationSchema = Yup.object().shape({
        searchfield: Yup.string()
    });
    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, reset, formState } = useForm(formOptions);

    useEffect(() => {
        userService.getAll().then(x => setUsers(x));
    }, []);

    function deleteUser(id) {
        setUsers(users.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        userService.delete(id).then(() => {
            setUsers(users => users.filter(x => x.id !== id));
        });
    }

    function onSubmit() {
        console.log("-----data-----",searchfield);
        return userService.create(searchfield)
        .then((data) => {
            console.log("-38----data----",data);

            if (data && data.lex) {
                setDatatodisplay(data.ResultItems);
                setDatatodisplayKendraFlag(false);
                setNoDataFoundFlag(false);
                setDatatodisplayFlag(true);

            } else if (data && data.kendra) {
                setDatatodisplayKendra(data.ResultItems);
                setDatatodisplayFlag(false);
                setNoDataFoundFlag(false);
                setDatatodisplayKendraFlag(true);
            } else {
                setDatatodisplayFlag(false);
                setDatatodisplayKendraFlag(false);
                setNoDataFoundFlag(true);
                setNoDataFound(data.notFound);
            }
        })
        .catch({});
    }

    function handleChange(event) {
        console.log(event.target.value);
      }

    return (
        <div>
            <h1>Search Queries</h1>

            <h1>Search Text</h1>
            <div className="form-row">
                <div className="form-group col-10">
                    <input name="searchfield" type="text" placeholder='Enter Text' onChange={e => setSearchfield(e.target.value)}  className={`form-control`} />
                </div>
                <div className="form-group">
                <button onClick={onSubmit} className="btn btn-primary mr-2">
                    Search
                </button>
            </div>
            </div>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th style={{ width: '1000%' }}>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {datatodisplayFlag && datatodisplay && datatodisplay.length > 0 && datatodisplay.map(row =>
                        <tr key={new Date().toISOString()}>
                            <td>{row.content} </td>
                        </tr>
                    )}
                    {datatodisplayKendraFlag && datatodisplayKendra && datatodisplayKendra.length > 0 && datatodisplayKendra.map(row =>
                        <tr key={new Date().toISOString()}>
                            <td>{row.DocumentURI} </td>
                            <td>{row.DocumentTitle['text']} </td>
                            <td>{row.DocumentExcerpt['text']} </td>
                        </tr>
                    )}
                     {noDataFoundFlag && noDataFound && datatodisplayKendra.map(row =>
                        <tr key={new Date().toISOString()}>
                            <td>{noDataFound} </td>
                        </tr>
                    )}

                </tbody>
            </table>
        </div>
    );
}

// Packages
import { useState } from 'react';
import { useMatch, useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { object, string } from 'yup';
import PropTypes from 'prop-types';
import { supabase } from '../../../../../utils/supabase_client';

// Styles
import formStyles from '../../../../../styles/form.module.css';
import { icon } from '../../../../../styles/icon.module.css';

// Components
import { Loading } from '../../../../utils/Loading/Loading';

// Utils
import { handleFetch } from '../../../../../utils/handle_fetch';

// Variables
const classes = classNames.bind(formStyles);
const RESOURCE_URL =
	import.meta.env.MODE === 'production'
		? import.meta.env.VITE_RESOURCE_URL
		: import.meta.env.VITE_LOCAL_RESOURCE_URL;

export const Folder_Create = ({ folderId, onUpdateFolder, onActiveModal }) => {
	const [inputErrors, setInputErrors] = useState({});
	const [formData, setFormData] = useState({ name: '' });
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const { pathname: previousPath } = useLocation();

	const uploadFileFromShared_File = useMatch('/drive/shared/:id');
	const uploadFileFromSubfolderShared_File = useMatch(
		'/drive/folders/:id/shared/:id',
	);
	const uploadFileFromFile_Info = useMatch('/drive/files/:id');
	const uploadFileFromSubfolderFile_Info = useMatch(
		'/drive/folders/:id/files/:id',
	);

	const handleChange = e => {
		const { value, name } = e.target;
		const fields = {
			...formData,
			[name]: value,
		};
		setFormData(fields);
	};

	const handleValidFields = async () => {
		let isValid = false;

		const schema = object({
			name: string()
				.trim()
				.required('Folder name is required.')
				.max(200, ({ max }) => `Folder name must be less then ${max} letters.`),
		}).noUnknown();

		try {
			await schema.validate(formData, {
				abortEarly: false,
				stripUnknown: true,
			});
			setInputErrors({});
			isValid = true;
			return isValid;
		} catch (err) {
			const obj = {};
			for (const error of err.inner) {
				obj[error.path] ?? (obj[error.path] = error.message);
			}
			setInputErrors(obj);
			return isValid;
		}
	};

	const handleCreateSubfolder = async () => {
		setLoading(true);
		const {
			data: {
				session: { access_token },
			},
		} = await supabase.auth.getSession();

		const url = `${RESOURCE_URL}/api/folders`;

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			body: JSON.stringify({ ...formData, folderId }),
		};

		const result = await handleFetch(url, options);

		const handleSuccess = () => {
			onUpdateFolder(result.data);
			(uploadFileFromShared_File || uploadFileFromFile_Info) &&
				navigate('/drive');
			(uploadFileFromSubfolderShared_File ||
				uploadFileFromSubfolderFile_Info) &&
				navigate(`/drive/folders/${folderId}`);
			onActiveModal({ component: null });
		};

		const handleError = () => {
			navigate('/drive/error', {
				state: { error: result.message, previousPath },
			});
			onActiveModal({ component: null });
		};

		result.success
			? handleSuccess()
			: result.fields
				? setInputErrors({ ...result.fields })
				: handleError();
		setLoading(false);
	};

	const handleSubmit = async e => {
		e.preventDefault();

		const isValid = !loading && (await handleValidFields());
		isValid && (await handleCreateSubfolder());
	};
	return (
		<>
			{loading && <Loading text={'Creating...'} light={true} shadow={true} />}
			<form className={formStyles.form} onSubmit={handleSubmit}>
				<div className={formStyles['input-wrap']}>
					<label htmlFor="name" className={formStyles['form-label']}>
						Folder Name
						<input
							type="text"
							id="name"
							className={`${classes({
								'form-input': true,
								'form-input-modal-bgc': true,
								'form-input-error': inputErrors.name,
							})}`}
							name="name"
							title="The folder name is required."
							value={formData.folder}
							onChange={handleChange}
							autoFocus
						/>
					</label>
					<div
						className={classes({
							'form-message-wrap': true,
							'form-message-active': inputErrors.name,
						})}
					>
						<span className={`${icon} ${formStyles.alert}`} />
						<p className={formStyles['form-message']}>
							{inputErrors.name ? inputErrors.name : 'Message Placeholder'}
						</p>
					</div>
				</div>

				<button type="submit" className={formStyles['form-submit']}>
					Create
				</button>
			</form>
		</>
	);
};

Folder_Create.propTypes = {
	folderId: PropTypes.string,
	onUpdateFolder: PropTypes.func,
	onActiveModal: PropTypes.func,
};

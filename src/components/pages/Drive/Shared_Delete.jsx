// Packages
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { supabase } from '../../../utils/supabase_client';

// folderStyles
import folderStyles from './Folder/Folder.module.css';

// Components
import { Loading } from '../../utils/Loading/Loading';

// Utils
import { handleFetch } from '../../../utils/handle_fetch';

export const SharedDelete = ({
	name,
	sharedFileId,
	onDeleteSharedFile,
	onActiveModal,
}) => {
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const { pathname } = useLocation();

	const handleDeleteFile = async () => {
		setLoading(true);

		const {
			data: {
				session: { access_token },
			},
		} = await supabase.auth.getSession();

		const url = `${import.meta.env.VITE_RESOURCE_URL}/api/sharedFiles/${sharedFileId}`;

		const options = {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		};

		const result = await handleFetch(url, options);

		result.success
			? onDeleteSharedFile(sharedFileId)
			: navigate('/drive/error', {
					state: { error: result.message, previousPath: pathname },
				});

		onActiveModal({ component: null });
	};

	return (
		<>
			{loading && <Loading text={'Stopping...'} light={true} shadow={true} />}
			<div className={folderStyles['folder-delete']}>
				<h3>Stop sharing file</h3>
				<div className={folderStyles.container}>
					<p>Do you really want to unshare?</p>
					<p className={folderStyles.name}>{`"${name}"`}</p>
					<div className={folderStyles['folder-button-wrap']}>
						<button
							className={`${folderStyles['folder-button']} ${folderStyles.cancel}`}
							onClick={e =>
								e.target === e.currentTarget &&
								onActiveModal({ component: null })
							}
						>
							Cancel
						</button>
						<button
							className={`${folderStyles['folder-button']} ${folderStyles.delete}`}
							onClick={handleDeleteFile}
						>
							Stop
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

SharedDelete.propTypes = {
	name: PropTypes.string,
	sharedFileId: PropTypes.string,
	onDeleteSharedFile: PropTypes.func,
	onActiveModal: PropTypes.func,
};

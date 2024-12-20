// Packages
import { Link, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import PropTypes from 'prop-types';

// Styles
import driveStyles from '../../Drive.module.css';
import { icon } from '../../../../../styles/icon.module.css';
import styles from './Subfolders.module.css';

// Components
import { FolderUpdate } from './Folder_Update';
import { FolderDelete } from './Folder_Delete';

export const Subfolders = ({ subfolders }) => {
	const {
		folders,
		menu,
		onActiveMenu,
		onActiveModal,
		onUpdateFolder,
		onDeleteFolder,
	} = useOutletContext();

	const isNormalTablet = useMediaQuery({ minWidth: 700 });

	return (
		<>
			<h3 className={driveStyles.title}>Folders</h3>
			<ul className={driveStyles.list}>
				{isNormalTablet && (
					<li className={driveStyles.item}>
						<div className={`${driveStyles.container} ${driveStyles.head}`}>
							<div>Name</div>
							<div className={driveStyles.date}>Created At</div>
						</div>
						<div className={driveStyles['options-button']} />
					</li>
				)}
				{subfolders.map(subfolder => (
					<li key={subfolder.id} className={driveStyles.item}>
						<Link
							to={`/drive/folders/${subfolder.id}`}
							className={driveStyles.container}
						>
							<span className={`${icon} ${styles.folder}`} />
							<p
								className={`${driveStyles.name} ${driveStyles.span}`}
								title={subfolder.name}
							>
								{subfolder.name}
							</p>
							<div className={`${driveStyles.info} ${driveStyles.date}`}>
								{!isNormalTablet && (
									<span
										className={`${icon} ${driveStyles.calendar}`}
										data-testid="calendar-icon"
									/>
								)}
								{format(subfolder.createdAt, 'MMM d, y')}
							</div>
						</Link>
						<div className={driveStyles.options}>
							<button
								onClick={() =>
									onActiveMenu({
										id: subfolder.id,
										button: 'options-button',
										name: 'options-menu',
									})
								}
								className={driveStyles['options-button']}
								data-id={subfolder.id}
								data-button="options-button"
								title="options-button"
							>
								<span className={`${icon} ${driveStyles.option}`} />
							</button>
							{menu.name === 'options-menu' && menu.id === subfolder.id && (
								<ul className={`options-menu ${driveStyles['options-menu']}`}>
									<li>
										<button
											type="button"
											className={driveStyles['options-menu-button']}
											onClick={() =>
												onActiveModal({
													component: (
														<FolderUpdate
															folder={subfolder}
															onUpdateFolder={onUpdateFolder}
															onActiveModal={onActiveModal}
														/>
													),
												})
											}
										>
											<span className={`${icon} ${driveStyles.edit}`} />
											Rename
										</button>
									</li>
									<li>
										<button
											type="button"
											className={driveStyles['options-menu-button']}
											onClick={() =>
												onActiveModal({
													component: (
														<FolderDelete
															folder={subfolder}
															folders={folders}
															onDeleteFolder={onDeleteFolder}
															onActiveModal={onActiveModal}
														/>
													),
												})
											}
										>
											<span className={`${icon} ${driveStyles.delete}`} />
											Remove
										</button>
									</li>
								</ul>
							)}
						</div>
					</li>
				))}
			</ul>
		</>
	);
};

Subfolders.propTypes = {
	subfolders: PropTypes.array,
};

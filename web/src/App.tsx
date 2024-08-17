import { useState } from "react";
import "./App.css";
import { isEnvBrowser } from "./utils/misc";
import {
	Badge,
	Group,
	Transition,
	Text,
	Button,
	Divider,
	SimpleGrid,
	Title,
	Modal,
	ScrollArea,
} from "@mantine/core";
import { useNuiEvent } from "./hooks/useNuiEvent";
import {
	IconPlayerPlay,
	IconPlus,
	IconTrash,
	IconUsersGroup,
} from "@tabler/icons-react";
import InfoCard from "./components/InfoCard";
import { fetchNui } from "./utils/fetchNui";
import { useDisclosure } from "@mantine/hooks";
import CreateCharacterModal from "./components/CreateCharacterModal";
import { modals } from "@mantine/modals";

type CharacterMetadata = Array<{ key: string; value: string }>;

interface Character {
	citizenid: string;
	name: string;
	metadata: CharacterMetadata;
	cid: number;
}

const DEBUG_CHARACTERS: Character[] = [
	{
		citizenid: "Whatever",
		name: "John Doe",
		metadata: [
			{
				key: "job",
				value: "Police",
			},
			{
				key: "nationality",
				value: "Denmark",
			},
			{
				key: "bank",
				value: "100.0000",
			},
			{
				key: "cash",
				value: "430.000",
			},
			{
				key: "birthdate",
				value: "12-10-1899",
			},
			{
				key: "gender",
				value: "Male",
			},
		],
		cid: 1,
	},
	{
		citizenid: "Whatever12",
		name: "Jenna Doe",
		metadata: [
			{
				key: "job",
				value: "Police",
			},
			{
				key: "nationality",
				value: "Denmark",
			},
			{
				key: "bank",
				value: "100.0000",
			},
			{
				key: "cash",
				value: "430.000",
			},
			{
				key: "birthdate",
				value: "12-10-1899",
			},
			{
				key: "gender",
				value: "Male",
			},
		],
		cid: 2,
	},
	{
		citizenid: "Hallo",
		name: "Jake long",
		metadata: [
			{
				key: "job",
				value: "Police",
			},
			{
				key: "nationality",
				value: "Denmark",
			},
			{
				key: "bank",
				value: "100.0000",
			},
			{
				key: "cash",
				value: "430.000",
			},
			{
				key: "birthdate",
				value: "12-10-1899",
			},
			{
				key: "gender",
				value: "Male",
			},
		],
		cid: 3,
	},
];

function App() {
	const [visible, setVisible] = useState(isEnvBrowser() ? true : false);
	const [characters, setCharacters] = useState<Character[]>(
		isEnvBrowser() ? DEBUG_CHARACTERS : []
	);
	const [isSelected, setIsSelected] = useState(-1);
	const [createCharacterId, setCreateCharacterId] = useState(-1);
	const [opened, { open, close }] = useDisclosure(false);
	const [allowedCharacters, setAllowedCharacters] = useState(
		isEnvBrowser() ? 3 : 0
	);

	useNuiEvent<{ characters: Character[]; allowedCharacters: number }>(
		"showMultiChar",
		(data) => {
			setCharacters(data.characters);
			setAllowedCharacters(data.allowedCharacters);
			setVisible(true);
		}
	);

	const HandleSelect = async (key: number, citizenid: string) => {
		await fetchNui<number>(
			"selectCharacter",
			{ citizenid: citizenid },
			{ data: 1 }
		);
		setIsSelected(key);
	};

	const HandlePlay = async (citizenid: string) => {
		setVisible(false);
		setCharacters([]);
		setIsSelected(-1);
		await fetchNui<number>(
			"playCharacter",
			{ citizenid: citizenid },
			{ data: 1 }
		);
	};

	const HandleDelete = async (citizenid: string) => {
		setVisible(false);
		setCharacters([]);
		setIsSelected(-1);
		await fetchNui<number>(
			"deleteCharacter",
			{ citizenid: citizenid },
			{ data: 1 }
		);
	};

	const HandleCreate = () => {
		close();
		setVisible(false);
		setCharacters([]);
		setIsSelected(-1);
	};

	const openDeleteModal = (citizenid: string) =>
		modals.openConfirmModal({
			title: "Delete your character",
			centered: true,
			children: (
				<Text size='sm'>Are you sure you want to delete your character?</Text>
			),
			labels: { confirm: "Delete character", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onCancel: () => console.log("Cancel"),
			onConfirm: () => HandleDelete(citizenid),
		});

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title={"Create Character " + (createCharacterId + 1)}
				centered
			>
				<CreateCharacterModal
					id={createCharacterId + 1}
					handleCreate={HandleCreate}
				/>
			</Modal>

			<div className={`app-container`}>
				<div className='container'>
					{visible && (
						<div className='character-selector-top'>
							<IconUsersGroup size={45} color='#228be6' />
							<Title order={2} fz={32} c={"blue"}>
								Character Selector
							</Title>
							<Text fw={500} fz={14}>
								Select the character you want to play
							</Text>
						</div>
					)}

					<Transition transition='slide-up' mounted={visible}>
						{(style) => (
							<ScrollArea style={{ ...style }} w={1650}>
								<div className='multichar'>
									{[...Array(allowedCharacters)].map((_, index) => {
										const character = characters[index];
										return character ? (
											<div className='character-card'>
												<Group justify='space-between'>
													<Text fw={500}>{character.name}</Text>
													<Badge
														color='rgba(196, 196, 196, 1)'
														variant='light'
														radius='sm'
													>
														{character.citizenid}
													</Badge>
												</Group>

												<div
													className={
														isSelected === character.cid ? "show" : "hide"
													}
												>
													<SimpleGrid cols={2} spacing={3}>
														{character.metadata &&
															character.metadata.length > 0 &&
															character.metadata.map((metadata) => (
																<InfoCard
																	key={metadata.key}
																	icon={metadata.key}
																	label={metadata.value}
																/>
															))}
													</SimpleGrid>

													<Divider color='gray' />

													<div className='character-card-actions'>
														<Button
															color='green'
															variant='light'
															fullWidth
															leftSection={<IconPlayerPlay size={14} />}
															h={30}
															onClick={() => {
																HandlePlay(character.citizenid);
															}}
														>
															Play
														</Button>

														<Button
															color='red'
															variant='light'
															fullWidth
															leftSection={<IconTrash size={14} />}
															h={30}
															onClick={() => {
																openDeleteModal(character.citizenid);
															}}
														>
															Delete
														</Button>
													</div>
												</div>

												<div
													className={
														isSelected === character.cid ? "hide" : "show"
													}
												>
													<Button
														color='blue'
														variant='light'
														fullWidth
														h={30}
														onClick={() => {
															HandleSelect(character.cid, character.citizenid);
														}}
													>
														Select
													</Button>
												</div>
											</div>
										) : (
											<div
												className='character-card create-card'
												key={`create-${index}`}
											>
												<Button
													color='blue'
													variant='light'
													fullWidth
													leftSection={<IconPlus size={24} />}
													onClick={() => {
														open();
														setCreateCharacterId(index);
													}}
												>
													Create New Character
												</Button>
											</div>
										);
									})}
								</div>
							</ScrollArea>
						)}
					</Transition>
				</div>
			</div>
		</>
	);
}

export default App;

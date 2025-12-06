import { BadRequestException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { BacklogsController } from "./backlogs.controller";
import { BacklogsService } from "./backlogs.service";

describe("BacklogsController", () => {
	let controller: BacklogsController;

	const mockBacklogsService = {
		getBacklog: jest.fn(),
		addItemToBacklog: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [BacklogsController],
			providers: [
				{
					provide: BacklogsService,
					useValue: mockBacklogsService,
				},
			],
		}).compile();

		controller = module.get<BacklogsController>(BacklogsController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getBacklog", () => {
		it("should return the backlog if found", () => {
			const mockBacklog = {
				id: "default",
				name: "My Backlog",
				items: [],
			};
			mockBacklogsService.getBacklog.mockReturnValue(mockBacklog);

			const result = controller.getBacklog("default");
			expect(result).toEqual(mockBacklog);
		});

		it("should throw BadRequestException if not found", () => {
			mockBacklogsService.getBacklog.mockReturnValue(undefined);

			expect(() => controller.getBacklog("unknown")).toThrow(
				BadRequestException,
			);
		});
	});

	describe("addItem", () => {
		it("should add an item and return its id and a message", () => {
			const dto = {
				externalServiceId: 123,
				name: "The Witcher 3",
				coverUrl: "http://example.com/witcher.jpg",
			};

			const newItem = {
				id: "uuid-123",
				...dto,
				addedAt: new Date(),
			};

			mockBacklogsService.addItemToBacklog.mockReturnValue(newItem);

			const result = controller.addItem("default", dto);

			expect(result).toEqual({
				id: newItem.id,
				message: "Item added successfully",
			});

			expect(mockBacklogsService.addItemToBacklog).toHaveBeenCalledWith(
				"default",
				{
					externalServiceId: dto.externalServiceId,
					name: dto.name,
					coverUrl: dto.coverUrl,
				},
			);
		});
	});
});

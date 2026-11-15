import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import * as bcrypt from "bcryptjs";
import { AppDataSource } from "./config/database.config";
import { User } from "./modules/users/entities/user.entity";
import { Project } from "./modules/project/entities/project.entity";
import { Milestone } from "./modules/milestone/entities/milestone.entity";
import { Task } from "./modules/task/entities/task.entity";
import { AccountRole } from "./common/enums/account-role.enum";
import { ProjectStatus } from "./common/enums/project-status.enum";
import { MilestoneStatus } from "./common/enums/milestone-status.enum";
import { TaskStatus } from "./common/enums/task-status.enum";

const SALT_ROUNDS = 10;

interface TaskSeedData {
  title: string;
  status: TaskStatus;
  dueDate: Date;
  assigneeRole: AccountRole.RESEARCHER | AccountRole.LAB_OWNER;
}

interface MilestoneSeedData {
  title: string;
  status: MilestoneStatus;
  dueDate: Date;
  tasks: TaskSeedData[];
}

interface ProjectSeedData {
  title: string;
  status: ProjectStatus;
  dueDate: Date;
  milestones: MilestoneSeedData[];
}

const DEMO_PROJECTS: ProjectSeedData[] = [
  {
    title: "Microfluidic Biochip Synthesis",
    status: ProjectStatus.IN_PROGRESS,
    dueDate: new Date("2027-06-30"),
    milestones: [
      {
        title: "Channel Geometry Simulation",
        status: MilestoneStatus.COMPLETED,
        dueDate: new Date("2027-02-28"),
        tasks: [
          {
            title: "Define fluid dynamic mesh boundaries",
            status: TaskStatus.COMPLETED,
            dueDate: new Date("2027-01-31"),
            assigneeRole: AccountRole.RESEARCHER,
          },
          {
            title: "Validate laminar flow rate thresholds",
            status: TaskStatus.COMPLETED,
            dueDate: new Date("2027-02-25"),
            assigneeRole: AccountRole.LAB_OWNER,
          },
        ],
      },
      {
        title: "Substrate Microfabrication & Testing",
        status: MilestoneStatus.IN_PROGRESS,
        dueDate: new Date("2027-05-31"),
        tasks: [
          {
            title: "Etch PDMS microchannels with cleanroom lithography",
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date("2027-04-15"),
            assigneeRole: AccountRole.RESEARCHER,
          },
          {
            title: "Inspect seal integrity under pneumatic pressure",
            status: TaskStatus.TODO,
            dueDate: new Date("2027-05-20"),
            assigneeRole: AccountRole.LAB_OWNER,
          },
        ],
      },
    ],
  },
  {
    title: "Quantum Dot Nanomaterial Characterization",
    status: ProjectStatus.PLANNING,
    dueDate: new Date("2027-12-31"),
    milestones: [
      {
        title: "Colloidal Precursor Preparation",
        status: MilestoneStatus.IN_PROGRESS,
        dueDate: new Date("2027-08-31"),
        tasks: [
          {
            title: "Synthesize organometallic selenium precursor solutions",
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date("2027-07-20"),
            assigneeRole: AccountRole.RESEARCHER,
          },
          {
            title: "Calibrate temperature ramp profile for core nucleation",
            status: TaskStatus.TODO,
            dueDate: new Date("2027-08-15"),
            assigneeRole: AccountRole.LAB_OWNER,
          },
        ],
      },
      {
        title: "Photoluminescence Spectroscopy",
        status: MilestoneStatus.PENDING,
        dueDate: new Date("2027-11-30"),
        tasks: [
          {
            title: "Measure quantum yield with integrating sphere detector",
            status: TaskStatus.TODO,
            dueDate: new Date("2027-10-15"),
            assigneeRole: AccountRole.RESEARCHER,
          },
          {
            title: "Compile emission spectra and decay lifetime report",
            status: TaskStatus.TODO,
            dueDate: new Date("2027-11-20"),
            assigneeRole: AccountRole.LAB_OWNER,
          },
        ],
      },
    ],
  },
];

async function seed(): Promise<void> {
  try {
    const researcherPassword = process.env.SEED_USER_PASSWORD?.trim();
    const labOwnerPassword = process.env.SEED_LAB_OWNER_PASSWORD?.trim();

    if (!researcherPassword) {
      throw new Error(
        "Missing or empty required environment variable: SEED_USER_PASSWORD",
      );
    }

    if (!labOwnerPassword) {
      throw new Error(
        "Missing or empty required environment variable: SEED_LAB_OWNER_PASSWORD",
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("[Seeder] AppDataSource successfully initialized.");
    }

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    const milestoneRepository = AppDataSource.getRepository(Milestone);
    const taskRepository = AppDataSource.getRepository(Task);

    // 1. Seed Demo Researcher
    const researcherEmail = "researcher@labify.demo";
    let researcher = await userRepository.findOne({
      where: { email: researcherEmail },
    });

    if (!researcher) {
      const passwordHash = await bcrypt.hash(researcherPassword, SALT_ROUNDS);

      researcher = userRepository.create({
        fullName: "Demo Researcher",
        email: researcherEmail,
        passwordHash,
        role: AccountRole.RESEARCHER,
      });
      researcher = await userRepository.save(researcher);
      console.log(`[Seeder] Created demo researcher: ${researcher.email}`);
    } else {
      console.log(`[Seeder] Demo researcher already exists: ${researcher.email}`);
    }

    // 2. Seed Demo Lab Owner
    const labOwnerEmail = "labowner@labify.demo";
    let labOwner = await userRepository.findOne({
      where: { email: labOwnerEmail },
    });

    if (!labOwner) {
      const passwordHash = await bcrypt.hash(labOwnerPassword, SALT_ROUNDS);

      labOwner = userRepository.create({
        fullName: "Demo Lab Owner",
        email: labOwnerEmail,
        passwordHash,
        role: AccountRole.LAB_OWNER,
      });
      labOwner = await userRepository.save(labOwner);
      console.log(`[Seeder] Created demo lab owner: ${labOwner.email}`);
    } else {
      console.log(`[Seeder] Demo lab owner already exists: ${labOwner.email}`);
    }

    const userMap: Record<AccountRole.RESEARCHER | AccountRole.LAB_OWNER, User> = {
      [AccountRole.RESEARCHER]: researcher,
      [AccountRole.LAB_OWNER]: labOwner,
    };

    // 3. Seed Projects, Milestones, and Tasks
    for (const projectData of DEMO_PROJECTS) {
      let project = await projectRepository.findOne({
        where: { title: projectData.title },
      });

      if (!project) {
        project = projectRepository.create({
          title: projectData.title,
          status: projectData.status,
          dueDate: projectData.dueDate,
        });
        project = await projectRepository.save(project);
        console.log(`[Seeder] Created project: "${project.title}"`);
      } else {
        console.log(`[Seeder] Project already exists: "${project.title}"`);
      }

      for (const milestoneData of projectData.milestones) {
        let milestone = await milestoneRepository.findOne({
          where: {
            projectId: project.projectId,
            title: milestoneData.title,
          },
        });

        if (!milestone) {
          milestone = milestoneRepository.create({
            projectId: project.projectId,
            title: milestoneData.title,
            status: milestoneData.status,
            dueDate: milestoneData.dueDate,
          });
          milestone = await milestoneRepository.save(milestone);
          console.log(
            `  [Seeder] Created milestone: "${milestone.title}" (Project: "${project.title}")`,
          );
        } else {
          console.log(
            `  [Seeder] Milestone already exists: "${milestone.title}" (Project: "${project.title}")`,
          );
        }

        for (const taskData of milestoneData.tasks) {
          let task = await taskRepository.findOne({
            where: {
              projectId: project.projectId,
              milestoneId: milestone.milestoneId,
              title: taskData.title,
            },
          });

          if (!task) {
            const assignee = userMap[taskData.assigneeRole];
            task = taskRepository.create({
              projectId: project.projectId,
              milestoneId: milestone.milestoneId,
              assigneeId: assignee.userId,
              title: taskData.title,
              status: taskData.status,
              dueDate: taskData.dueDate,
            });
            task = await taskRepository.save(task);
            console.log(
              `    [Seeder] Created task: "${task.title}" (Assignee: ${assignee.email})`,
            );
          } else {
            console.log(
              `    [Seeder] Task already exists: "${task.title}"`,
            );
          }
        }
      }
    }

    console.log("[Seeder] Demo data seeding process completed.");
  } catch (error) {
    console.error("[Seeder] Seeding encountered an error:", error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("[Seeder] AppDataSource connection closed.");
    }
  }
}

seed();

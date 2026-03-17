using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduManage.Infrastructure.Persistence;

public class EduManageDbContext : DbContext
{
    public EduManageDbContext(DbContextOptions<EduManageDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<PlanWorkout> PlanWorkouts { get; set; }
    public DbSet<Meeting> Meetings { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<Routine> Routines { get; set; }
    public DbSet<RoutineExercise> RoutineExercises { get; set; }
    public DbSet<RoutineSet> RoutineSets { get; set; }
    public DbSet<WorkoutHistory> WorkoutHistory { get; set; }
    public DbSet<CompletedExercise> CompletedExercises { get; set; }
    public DbSet<CompletedSet> CompletedSets { get; set; }
    public DbSet<SourceWorkout> SourceWorkouts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Client
        modelBuilder.Entity<Client>()
            .HasKey(c => c.InvitationCode);
        modelBuilder.Entity<Client>()
            .Property(c => c.Tags)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.None).ToList());

        // Plan
        modelBuilder.Entity<Plan>()
            .HasKey(p => p.Id);
        modelBuilder.Entity<Plan>()
            .HasOne(p => p.Client)
            .WithMany(c => c.Plans)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // PlanWorkout
        modelBuilder.Entity<PlanWorkout>()
            .HasKey(pw => pw.Id);
        modelBuilder.Entity<PlanWorkout>()
            .HasOne(pw => pw.Plan)
            .WithMany(p => p.Workouts)
            .HasForeignKey(pw => pw.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Meeting
        modelBuilder.Entity<Meeting>()
            .HasKey(m => m.Id);
        modelBuilder.Entity<Meeting>()
            .HasOne(m => m.Client)
            .WithMany(c => c.Meetings)
            .HasForeignKey(m => m.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Course
        modelBuilder.Entity<Course>()
            .HasKey(c => c.Id);

        // Exercise
        modelBuilder.Entity<Exercise>()
            .HasKey(e => e.Id);
        modelBuilder.Entity<Exercise>()
            .Property(e => e.Tags)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.None).ToList());

        // Routine
        modelBuilder.Entity<Routine>()
            .HasKey(r => r.Id);

        // RoutineExercise
        modelBuilder.Entity<RoutineExercise>()
            .HasKey(re => re.Id);
        modelBuilder.Entity<RoutineExercise>()
            .HasOne(re => re.Routine)
            .WithMany(r => r.Exercises)
            .HasForeignKey(re => re.RoutineId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<RoutineExercise>()
            .HasOne(re => re.PlanWorkout)
            .WithMany(pw => pw.Exercises)
            .HasForeignKey(re => re.PlanWorkoutId)
            .OnDelete(DeleteBehavior.SetNull);

        // RoutineSet
        modelBuilder.Entity<RoutineSet>()
            .HasKey(rs => rs.Id);
        modelBuilder.Entity<RoutineSet>()
            .HasOne(rs => rs.RoutineExercise)
            .WithMany(re => re.Sets)
            .HasForeignKey(rs => rs.RoutineExerciseId)
            .OnDelete(DeleteBehavior.Cascade);

        // WorkoutHistory
        modelBuilder.Entity<WorkoutHistory>()
            .HasKey(wh => wh.Id);

        // CompletedExercise
        modelBuilder.Entity<CompletedExercise>()
            .HasKey(ce => ce.Id);
        modelBuilder.Entity<CompletedExercise>()
            .HasOne(ce => ce.WorkoutHistory)
            .WithMany(wh => wh.Exercises)
            .HasForeignKey(ce => ce.WorkoutHistoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // CompletedSet
        modelBuilder.Entity<CompletedSet>()
            .HasKey(cs => cs.Id);
        modelBuilder.Entity<CompletedSet>()
            .HasOne(cs => cs.CompletedExercise)
            .WithMany(ce => ce.Sets)
            .HasForeignKey(cs => cs.CompletedExerciseId)
            .OnDelete(DeleteBehavior.Cascade);

        // SourceWorkout
        modelBuilder.Entity<SourceWorkout>()
            .HasKey(sw => sw.Id);
        modelBuilder.Entity<SourceWorkout>()
            .HasOne(sw => sw.WorkoutHistory)
            .WithOne(wh => wh.SourceWorkout)
            .HasForeignKey<SourceWorkout>(sw => sw.WorkoutHistoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed exercise data
        SeedExercises(modelBuilder);
    }

    private static void SeedExercises(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Exercise>().HasData(
            new Exercise
            {
                Id = 1,
                Name = "Squat",
                ShortDescription = "Back squat pattern",
                PrimaryMuscle = "Quadriceps",
                MusclesJson = "[{\"name\":\"Quadriceps\"}]",
                Tags = ["Legs", "Strength"]
            },
            new Exercise
            {
                Id = 2,
                Name = "Bench Press",
                ShortDescription = "Barbell horizontal press",
                PrimaryMuscle = "Chest",
                MusclesJson = "[{\"name\":\"Pectorals\"}]",
                Tags = ["Chest", "Strength"]
            },
            new Exercise
            {
                Id = 3,
                Name = "Deadlift",
                ShortDescription = "Hip hinge pull",
                PrimaryMuscle = "Posterior Chain",
                MusclesJson = "[{\"name\":\"Hamstrings\"}]",
                Tags = ["Back", "Strength"]
            }
        );
    }
}

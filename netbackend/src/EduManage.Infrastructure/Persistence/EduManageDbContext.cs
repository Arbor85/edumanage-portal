using EduManage.Domain.Entities;
using EduManage.Infrastructure.Persistence.Configurations;
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

        // Apply all configurations
        modelBuilder.ApplyConfiguration(new ClientConfiguration());
        modelBuilder.ApplyConfiguration(new PlanConfiguration());
        modelBuilder.ApplyConfiguration(new PlanWorkoutConfiguration());
        modelBuilder.ApplyConfiguration(new MeetingConfiguration());
        modelBuilder.ApplyConfiguration(new CourseConfiguration());
        modelBuilder.ApplyConfiguration(new ExerciseConfiguration());
        modelBuilder.ApplyConfiguration(new RoutineConfiguration());
        modelBuilder.ApplyConfiguration(new RoutineExerciseConfiguration());
        modelBuilder.ApplyConfiguration(new RoutineSetConfiguration());
        modelBuilder.ApplyConfiguration(new WorkoutHistoryConfiguration());
        modelBuilder.ApplyConfiguration(new CompletedExerciseConfiguration());
        modelBuilder.ApplyConfiguration(new CompletedSetConfiguration());
        modelBuilder.ApplyConfiguration(new SourceWorkoutConfiguration());
    }
}
